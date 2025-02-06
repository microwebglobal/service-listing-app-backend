const {
  Booking,
  Service,
  BookingItem,
  BookingPayment,
  ServiceItem,
  PackageItem,
  PackageSection,
  CitySpecificPricing,
  SpecialPricing,
  SubCategory,
  ServiceCategory,
  ServiceProvider,
  User,
  ProviderServiceCity,
  ProviderServiceCategory,
  AssignmentHistory,
  BookingAssignmentSettings,
  SystemSettings,
  ServiceType,
  Package,
} = require("../models");
const { Op } = require("sequelize");
const IdGenerator = require("../utils/helper");
const { sequelize } = require("../models");
const { v4: uuidv4 } = require("uuid");

class BookingController {
  static validateTimeSlot(time) {
    const validStartHour = 11;
    const validEndHour = 20;
    const [hour, minutes] = time.split(":").map((num) => parseInt(num));

    return (
      hour >= validStartHour &&
      hour <= validEndHour &&
      (minutes === 0 || minutes === 30) &&
      !(hour === validEndHour && minutes === 30)
    );
  }

  static calculateTotalDuration(items) {
    return items.reduce((total, item) => {
      const duration = item.duration_hours * 60 + item.duration_minutes;
      return total + duration * item.quantity;
    }, 0);
  }

  static async proceedToPayment(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const booking = await Booking.findOne({
        where: {
          user_id: req.user.id,
          status: "cart",
        },
        include: [{ model: BookingPayment }],
      });

      if (!booking) {
        return res.status(404).json({ message: "No active cart found" });
      }

      await booking.update({ status: "payment_pending" });

      res.status(200).json({
        message: "Booking ready for payment",
        booking: await booking.reload({
          include: [{ model: BookingItem }, { model: BookingPayment }],
        }),
      });
    } catch (error) {
      console.error("Proceed to Payment Error:", error);
      next(error);
    }
  }

  static async getBookingByCustomer(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const bookings = await Booking.findAll({
        where: {
          user_id: req.user.id,
          status: {
            [Op.ne]: "cart", // Exclude cart items
          },
        },
        include: [
          {
            model: BookingItem,
            include: [
              {
                model: ServiceItem,
                as: "serviceItem",
                required: false,
              },
              {
                model: PackageItem,
                as: "packageItem",
                required: false,
                include: [
                  {
                    model: PackageSection,
                    as: "PackageSection",
                    required: false,
                    include: [
                      {
                        model: Package,
                        as: "Package",
                        required: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { model: BookingPayment },
          {
            model: ServiceProvider,
            include: [{ model: User, attributes: ["name", "email", "mobile"] }],
          },
        ],
      });

      if (!bookings || bookings.length === 0) {
        return res.status(404).json({ message: "No bookings found" });
      }

      res.status(200).json(bookings);
    } catch (error) {
      console.error("Get Customer Bookings Error:", error);
      next(error);
    }
  }

  static async getCurrentPrice(itemId, itemType, cityId) {
    try {
      const currentDate = new Date();
      const specialPricing = await SpecialPricing.findOne({
        where: {
          item_id: itemId,
          item_type: itemType,
          city_id: cityId,
          status: "active",
          start_date: { [Op.lte]: currentDate },
          end_date: { [Op.gte]: currentDate },
        },
      });

      if (specialPricing) return specialPricing.special_price;

      const cityPricing = await CitySpecificPricing.findOne({
        where: {
          item_id: itemId,
          item_type: itemType,
          city_id: cityId,
        },
      });

      if (cityPricing) return cityPricing.price;

      const Model = itemType === "service_item" ? ServiceItem : PackageItem;
      const item = await Model.findByPk(itemId);
      if (!item) throw new Error(`Item not found: ${itemId}`);

      return itemType === "service_item" ? item.base_price : item.price;
    } catch (error) {
      console.error("Error getting current price:", error);
      throw error;
    }
  }

  static async assignServiceProvider(bookingId, cityId, transaction) {
    try {
      // Check if auto-assignment is enabled
      const autoAssignmentSetting = await SystemSettings.findOne({
        where: {
          category: "provider_assignment",
          key: "auto_assignment_enabled",
        },
        transaction,
      });

      if (!autoAssignmentSetting || !JSON.parse(autoAssignmentSetting.value)) {
        console.log("Auto assignment is disabled");
        return null;
      }

      // Get daily booking count
      const dailyBookingCount = await Booking.count({
        where: {
          created_at: {
            [Op.gte]: new Date().setHours(0, 0, 0, 0),
          },
          status: {
            [Op.in]: ["confirmed", "assigned"],
          },
        },
        transaction,
      });

      // Generate random number between 1-10
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      const providerType = randomNumber <= 7 ? "individual" : "business";

      // Find eligible providers
      const eligibleProviders = await ServiceProvider.findAll({
        where: {
          status: "active",
          business_type: providerType,
          "$ProviderServiceCities.city_id$": cityId,
        },
        include: [
          {
            model: ProviderServiceCity,
            where: { city_id: cityId },
            required: true,
          },
        ],
        transaction,
      });

      if (!eligibleProviders.length) {
        throw new Error(
          `No eligible ${providerType} providers found in the city`
        );
      }

      // Randomly select provider
      const selectedProvider =
        eligibleProviders[Math.floor(Math.random() * eligibleProviders.length)];

      // Create assignment history
      await AssignmentHistory.create(
        {
          booking_id: bookingId,
          provider_id: selectedProvider.provider_id,
          provider_type: providerType,
          random_number: randomNumber,
          daily_booking_count: dailyBookingCount,
          attempt_number: 1,
          status: "assigned",
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction }
      );

      // Update booking
      await Booking.update(
        {
          provider_id: selectedProvider.provider_id,
          status: "assigned",
          assignment_type: "auto",
        },
        {
          where: { booking_id: bookingId },
          transaction,
        }
      );

      return selectedProvider;
    } catch (error) {
      console.error("Provider assignment error:", error);
      throw error;
    }
  }

  static async manuallyAssignProvider(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { bookingId, providerId } = req.body;

      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
        transaction,
      });

      if (!booking) {
        await transaction.rollback();
        return res.status(404).json({ message: "Booking not found" });
      }

      const provider = await ServiceProvider.findOne({
        where: { provider_id: providerId, status: "active" },
        include: [
          {
            model: ProviderServiceCity,
            where: { city_id: booking.city_id },
            required: true,
          },
        ],
        transaction,
      });

      if (!provider) {
        await transaction.rollback();
        return res.status(404).json({ message: "Eligible provider not found" });
      }

      // Create assignment history
      await AssignmentHistory.create(
        {
          booking_id: bookingId,
          provider_id: providerId,
          provider_type: provider.business_type,
          status: "assigned",
          attempt_number: 1,
          assignment_type: "manual",
          assigned_by: req.user.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction }
      );

      // Update booking
      await booking.update(
        {
          provider_id: providerId,
          status: "assigned",
          assignment_type: "manual",
        },
        { transaction }
      );

      await transaction.commit();

      const updatedBooking = await Booking.findByPk(bookingId, {
        include: [
          { model: BookingItem },
          { model: BookingPayment },
          {
            model: ServiceProvider,
            include: [{ model: User, attributes: ["name", "email", "mobile"] }],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        message: "Provider manually assigned successfully",
        booking: updatedBooking,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Manual assignment error:", error);
      next(error);
    }
  }

  static async processPayment(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { amount, bookingId, paymentMethod, cardNumber, expiry, cvv } =
        req.body;

      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
        transaction,
      });

      const payment = await BookingPayment.findOne({
        where: { booking_id: bookingId },
        transaction,
      });

      let isSuccess = false;

      if (paymentMethod === "card") {
        if (!cardNumber || !expiry || !cvv) {
          return res.status(400).json({ error: "Card details required" });
        }
        isSuccess = Math.random() > 0.2; // 80% success rate for card
      } else if (paymentMethod === "cash") {
        isSuccess = true; // Cash payments always proceed
      }

      if (isSuccess) {
        // Update payment
        await payment.update(
          {
            payment_method: paymentMethod,
            payment_status: paymentMethod === "cash" ? "pending" : "completed",
            transaction_id: uuidv4(),
          },
          { transaction }
        );

        // Update booking
        await booking.update(
          {
            status: "confirmed",
          },
          { transaction }
        );

        // Try automatic assignment if enabled
        let assignedProvider = null;
        try {
          assignedProvider = await BookingController.assignServiceProvider(
            bookingId,
            booking.city_id,
            transaction
          );
        } catch (assignError) {
          console.error("Auto-assignment failed:", assignError);
          // Continue without assignment if auto-assignment fails
        }

        await transaction.commit();

        const updatedBooking = await Booking.findByPk(bookingId, {
          include: [
            { model: BookingItem },
            { model: BookingPayment },
            {
              model: ServiceProvider,
              include: [
                { model: User, attributes: ["name", "email", "mobile"] },
              ],
            },
          ],
        });

        return res.status(200).json({
          success: true,
          message: assignedProvider
            ? `Booking confirmed and assigned to ${assignedProvider.business_type} provider`
            : "Booking confirmed, awaiting manual provider assignment",
          booking: updatedBooking,
        });
      } else {
        await payment.update(
          {
            payment_status: "failed",
          },
          { transaction }
        );

        await transaction.commit();
        return res.status(200).json({
          success: false,
          message: "Payment failed",
        });
      }
    } catch (error) {
      await transaction.rollback();
      console.error("Payment Processing Error:", error);
      next(error);
    }
  }

  static async addToCart(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const {
        cityId,
        items,
        bookingDate,
        startTime,
        serviceAddress,
        serviceLocation,
        customerNotes,
      } = req.body;

      if (!cityId || !items || !bookingDate || !startTime) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!BookingController.validateTimeSlot(startTime)) {
        return res.status(400).json({
          message:
            "Invalid time slot. Please select a time between 11:00 AM and 8:30 PM in 30-minute intervals",
        });
      }

      let booking = await Booking.findOne({
        where: {
          user_id: req.user.id,
          status: "cart",
        },
      });

      if (!booking) {
        const existingBookings = await Booking.findAll({
          attributes: ["booking_id"],
        });

        const newBookingId = IdGenerator.generateId(
          "BKG",
          existingBookings.map((booking) => booking.booking_id)
        );

        // Format the location data for PostgreSQL
        const locationData = serviceLocation || {
          type: "Point",
          coordinates: [0, 0],
        };

        booking = await Booking.create({
          booking_id: newBookingId,
          user_id: req.user.id,
          city_id: cityId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: startTime,
          status: "cart",
          service_address: serviceAddress,
          service_location: locationData,
          customer_notes: customerNotes || "",
        });
      }

      // Clear existing items
      await BookingItem.destroy({
        where: { booking_id: booking.booking_id },
      });

      // Add new items
      let totalAmount = 0;
      for (const item of items) {
        const currentPrice = await BookingController.getCurrentPrice(
          item.itemId,
          item.itemType,
          cityId
        );

        const totalPrice = currentPrice * item.quantity;
        totalAmount += totalPrice;

        await BookingItem.create({
          booking_id: booking.booking_id,
          item_id: item.itemId,
          item_type: item.itemType,
          quantity: item.quantity,
          unit_price: currentPrice,
          total_price: totalPrice,
        });
      }

      // Update payment
      await BookingPayment.destroy({
        where: { booking_id: booking.booking_id },
      });

      const existingPaymentIds = await BookingPayment.findAll({
        attributes: ["payment_id"],
      });

      const taxAmount = totalAmount * 0.18;
      const totalWithTax = totalAmount + taxAmount;

      await BookingPayment.create({
        payment_id: IdGenerator.generateId(
          "PAY",
          existingPaymentIds.map((p) => p.payment_id)
        ),
        booking_id: booking.booking_id,
        payment_method: "card",
        payment_status: "pending",
        subtotal: totalAmount,
        tax_amount: taxAmount,
        total_amount: totalWithTax,
        tip_amount: 0, // Set default tip amount
        transaction_id: null, // Will be set during actual payment
        payment_date: null, // Will be set during actual payment
        payment_response: null, // Will be set during actual payment
      });

      const updatedBooking = await Booking.findByPk(booking.booking_id, {
        include: [
          {
            model: BookingItem,
            include: [
              { model: ServiceItem, as: "serviceItem", required: false },
              { model: PackageItem, as: "packageItem", required: false },
            ],
          },
          { model: BookingPayment },
        ],
      });

      res.status(200).json(updatedBooking);
    } catch (error) {
      console.error("Add to Cart Error:", error);
      next(error);
    }
  }

  static async getBooking(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const booking = await Booking.findOne({
        where: { booking_id: req.params.id },
        include: [
          {
            model: BookingItem,
            include: [
              { model: ServiceItem, as: "serviceItem", required: false },
              { model: PackageItem, as: "packageItem", required: false },
            ],
          },
          { model: BookingPayment },
        ],
      });
      if (!booking) {
        return res.status(404).json({ message: "No booking found" });
      }

      if (booking?.BookingPayment?.payment_status === "completed") {
        return res
          .status(405)
          .json({ message: "This Transaction Already Compleated" });
      }
      res.status(200).json(booking);
    } catch (error) {
      console.error("Get Booking Error:", error);
      next(error);
    }
  }

  static async getBookingByCustomer(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const booking = await Booking.findAll({
        where: {
          user_id: req.user.id,
        },
        include: [
          {
            model: BookingItem,
            include: [
              {
                model: ServiceItem,
                as: "serviceItem",
                required: false,
              },
              {
                model: PackageItem,
                as: "packageItem",
                required: false,
                include: [
                  {
                    model: PackageSection,
                    required: false,
                    include: [
                      {
                        model: Package,
                        as: "Package",
                        required: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { model: BookingPayment },
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.error("Get Booking Error:", error);
      next(error);
    }
  }

  static async getCart(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const cart = await Booking.findOne({
        where: {
          user_id: req.user.id,
          status: "cart",
        },
        include: [
          {
            model: BookingItem,
            include: [
              { model: ServiceItem, as: "serviceItem", required: false },
              { model: PackageItem, as: "packageItem", required: false },
            ],
          },
          { model: BookingPayment },
        ],
      });

      if (!cart) {
        return res.status(404).json({ message: "No active cart found" });
      }

      res.status(200).json(cart);
    } catch (error) {
      console.error("Get Cart Error:", error);
      next(error);
    }
  }

  static async updateCartItem(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { itemId, quantity } = req.body;

      if (!itemId || quantity === undefined) {
        return res
          .status(400)
          .json({ message: "Item ID and quantity are required" });
      }

      const booking = await Booking.findOne({
        where: {
          user_id: req.user.id,
          status: "cart",
        },
      });

      if (!booking) {
        return res.status(404).json({ message: "No active cart found" });
      }

      const bookingItem = await BookingItem.findOne({
        where: {
          booking_id: booking.booking_id,
          item_id: itemId,
        },
      });

      if (!bookingItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      if (quantity === 0) {
        await bookingItem.destroy();
      } else {
        const newTotalPrice = bookingItem.unit_price * quantity;
        await bookingItem.update({
          quantity,
          total_price: newTotalPrice,
        });
      }

      // Recalculate totals
      const allItems = await BookingItem.findAll({
        where: { booking_id: booking.booking_id },
      });

      const subtotal = allItems.reduce(
        (sum, item) => sum + item.total_price,
        0
      );

      const payment = await BookingPayment.findOne({
        where: { booking_id: booking.booking_id },
      });

      await payment.update({
        subtotal,
        tax_amount: subtotal * 0.18,
        total_amount: subtotal * 1.18 + (payment.tip_amount || 0),
      });

      res.status(200).json({
        message: "Cart updated successfully",
        booking: await booking.reload({
          include: [{ model: BookingItem }, { model: BookingPayment }],
        }),
      });
    } catch (error) {
      console.error("Update Cart Item Error:", error);
      next(error);
    }
  }

  static async updateTip(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { tipAmount, subTotal, taxAmount } = req.body;

      if (tipAmount === undefined) {
        return res.status(400).json({ message: "Tip amount is required" });
      }

      const booking = await Booking.findOne({
        where: {
          user_id: req.user.id,
          status: "cart",
        },
        include: [{ model: BookingPayment }],
      });

      if (!booking) {
        return res.status(404).json({ message: "No active cart found" });
      }

      const subtotal = parseFloat(subTotal) || 0;
      const tax = parseFloat(taxAmount) || 0;
      const tip = parseFloat(tipAmount) || 0;

      if (isNaN(subtotal) || isNaN(taxAmount) || isNaN(tip)) {
        return res
          .status(400)
          .json({ message: "Invalid numeric values in payment data" });
      }

      const newTotalAmount = subtotal + tax + tip;

      const payment = await BookingPayment.findOne({
        where: { booking_id: booking.booking_id },
      });

      await payment.update({
        tip_amount: tipAmount,
        total_amount: newTotalAmount,
      });

      res.status(200).json({
        message: "Tip updated successfully",
        payment: await payment.reload(),
      });
    } catch (error) {
      console.error("Update Tip Error:", error);
      next(error);
    }
  }

  static async completeCashPayment(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { bookingId } = req.params;

      const payment = await BookingPayment.findOne({
        where: {
          booking_id: bookingId,
          payment_method: "cash",
          payment_status: "pending",
        },
        transaction,
      });

      if (!payment) {
        return res
          .status(404)
          .json({ message: "No pending cash payment found for this booking" });
      }

      await payment.update(
        {
          payment_status: "completed",
          completed_at: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Cash payment marked as completed",
        payment: await payment.reload(),
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Complete Cash Payment Error:", error);
      next(error);
    }
  }

  static async getEligibleProviders(req, res, next) {
    try {
      const { bookingId } = req.params;

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const eligibleProviders = await ServiceProvider.findAll({
        where: {
          status: "active",
          "$ProviderServiceCities.city_id$": booking.city_id,
        },
        include: [
          {
            model: ProviderServiceCity,
            where: { city_id: booking.city_id },
            required: true,
          },
          {
            model: User,
            attributes: ["name", "email", "mobile"],
          },
        ],
      });

      res.status(200).json({
        success: true,
        providers: eligibleProviders,
      });
    } catch (error) {
      console.error("Get Eligible Providers Error:", error);
      next(error);
    }
  }
}

module.exports = BookingController;
