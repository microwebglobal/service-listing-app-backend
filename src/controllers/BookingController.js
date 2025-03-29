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
  ServiceCommission,
  ProviderServiceCity,
  AssignmentHistory,
  BookingAssignmentSettings,
  ServiceProviderEmployee,
  SystemSettings,
  ServiceType,
  CitySpecificBuffertime,
  Package,
} = require("../models");
const { Op, where } = require("sequelize");
const moment = require("moment");
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

      //get booking to check already have an provider
      const currentBooking = await Booking.findOne({
        where: { booking_id: bookingId },
        transaction,
      });

      const currentProviderId = currentBooking?.provider_id;

      // Find eligible providers
      const eligibleProviders = await ServiceProvider.findAll({
        where: {
          status: "active",
          business_type: providerType,
          "$providerCities.city_id$": cityId,
          provider_id: {
            [Op.ne]: currentProviderId, // Exclude the current provider
          },
        },
        include: [
          {
            model: ProviderServiceCity,
            as: "providerCities",
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
          distance_score: 7.8,
          rating_score: 1.2,
          workload_score: 5.3,
          provider_score: 2,
          status: "pending",
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
      const { paymentType, bookingId, paymentMethod, cardNumber, expiry, cvv } =
        req.body;

      console.log("Booking Details:", req.body);

      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
        include: [{ model: User, as: "customer" }],
        transaction,
      });

      const payment = await BookingPayment.findOne({
        where: { booking_id: bookingId },
        transaction,
      });

      const accBalance = parseFloat(booking?.customer?.acc_balance);
      let remainingBalance = accBalance;

      let isSuccess = false;

      if (paymentMethod === "card") {
        if (!cardNumber || !expiry || !cvv) {
          return res.status(400).json({ error: "Card details required" });
        }
        isSuccess = Math.random() > 0.2; // 80% success rate for card
      } else if (paymentMethod === "cash") {
        isSuccess = true; // Cash payments always proceed
      } else if (paymentMethod === "net_banking") {
        isSuccess = true; // Bank payments always proceed
      }

      if (isSuccess) {
        let paymentStatus;

        console.log(paymentMethod);
        console.log(paymentType);

        if (paymentType === "advance") {
          paymentStatus = "advance_only_paid";
          if (accBalance > 0) {
            remainingBalance = 0;
          }
        } else if (paymentType === "full" && paymentMethod === "cash") {
          paymentStatus = "pending";
          if (accBalance > 0) {
            remainingBalance = accBalance;
          }
        } else if (
          paymentType === "full" &&
          (paymentMethod === "net_banking" || paymentMethod === "card")
        ) {
          paymentStatus = "completed";
          if (accBalance > 0) {
            remainingBalance = 0;
          }
        }

        console.log(paymentStatus);
        // Update payment
        await payment.update(
          {
            payment_method: paymentMethod,
            payment_status: paymentStatus,
            transaction_id: uuidv4(),
          },
          { transaction }
        );

        await booking.customer.update({
          acc_balance: remainingBalance,
        });

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
          console.log(assignedProvider);
        } catch (assignError) {
          console.error("Auto-assignment failed:", assignError);

          // Continue without assignment if auto-assignment fails
        }

        console;

        await transaction.commit();

        const updatedBooking = await Booking.findByPk(bookingId, {
          include: [
            { model: BookingItem },
            { model: BookingPayment },
            {
              model: ServiceProvider,
              as: "provider",
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
      if (transaction.finished !== "commit") {
        await transaction.rollback();
      }
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

      console.log(req.body);

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

        //calculate end time
        const getEndTime = () => {
          if (
            !startTime ||
            typeof startTime !== "string" ||
            !startTime.includes(":")
          ) {
            console.error("Invalid startTime:", startTime);
            return "00:00";
          }

          let totalMinutes = 0;
          for (const item of items) {
            const hours = Number(item.duration_hours) || 0;
            const minutes = Number(item.duration_minutes) || 0;
            totalMinutes += hours * 60 + minutes;
          }

          const [startHour, startMinute] = startTime.split(":").map(Number);
          if (isNaN(startHour) || isNaN(startMinute)) {
            console.error("Invalid start hour/minute:", startHour, startMinute);
            return "00:00";
          }

          const startDate = new Date();
          startDate.setHours(startHour, startMinute, 0, 0);
          startDate.setMinutes(startDate.getMinutes() + totalMinutes);

          const endHour = startDate.getHours().toString().padStart(2, "0");
          const endMinute = startDate.getMinutes().toString().padStart(2, "0");

          return `${endHour}:${endMinute}`;
        };

        const endTime = getEndTime();

        booking = await Booking.create({
          booking_id: newBookingId,
          user_id: req.user.id,
          city_id: cityId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
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
      let totalAdvanceAmount = 0;
      let totalServiceCommition = 0;
      for (const item of items) {
        const currentPrice = await BookingController.getCurrentPrice(
          item.itemId,
          item.itemType,
          cityId
        );

        const bookedItem = await ServiceItem.findOne({
          where: { item_id: item.itemId },
          attributes: ["advance_percentage", "is_home_visit"],
        });

        const serviceCommiton = await ServiceCommission.findOne({
          where: { city_id: cityId, item_id: item.itemId },
        });

        const serviceCommitionRate =
          parseFloat(serviceCommiton?.commission_rate) / 100;

        const advancePercentage = bookedItem?.advance_percentage;

        const advanceAmount = currentPrice * (advancePercentage / 100);

        const totalPrice = currentPrice * item.quantity;
        totalAmount += totalPrice;
        totalAdvanceAmount += advanceAmount;

        const serviceCommitionAmount = totalPrice * serviceCommitionRate;

        totalServiceCommition += serviceCommitionAmount;

        console.log(serviceCommitionRate);
        console.log(serviceCommitionAmount);
        console.log(totalServiceCommition);

        await BookingItem.create({
          booking_id: booking.booking_id,
          item_id: item.itemId,
          item_type: item.itemType,
          quantity: item.quantity,
          unit_price: currentPrice,
          total_price: totalPrice,
          service_commition: serviceCommitionAmount,
          advance_payment: advanceAmount,
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
        advance_payment: totalAdvanceAmount,
        tip_amount: 0, // Set default tip amount
        service_commition: totalServiceCommition || 0,
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
          { model: User, as: "customer" },
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
          {
            model: ServiceProvider,
            as: "provider",
            include: [{ model: User, attributes: ["name", "email", "mobile"] }],
          },
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
          { model: User, as: "customer" },
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
    console.log(req.body);
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

      const subtotalNum = Number(subtotal);
      const taxAmount = Number(subtotalNum * 0.18);
      const tipAmount = Number(payment?.tip_amount) || 0;
      const totalAmount = subtotalNum * 1.18 + tipAmount;

      await payment.update({
        subtotal: subtotalNum.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
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
      console.error("Get Eligible Providers Error: ", error);
      next(error);
    }
  }

  static async providerAcceptOrder(req, res, next) {
    const transaction = await sequelize.transaction();

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;

    try {
      const booking = await Booking.findOne({
        where: { booking_id: id },
        transaction,
      });

      const bookingHistory = await AssignmentHistory.findOne({
        where: { booking_id: id, status: "pending" },
        transaction,
      });

      if (req.user.role === "business_service_provider") {
        const { employee_id } = req.body;

        await booking.update(
          { status: "accepted", employee_id: employee_id },
          transaction
        );
      }

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      await booking.update({ status: "accepted" }, transaction);

      if (bookingHistory) {
        await bookingHistory.update({
          status: "accepted",
        }),
          transaction;
      }
      await transaction.commit();
      res.status(200).json({ message: "Booking Acepted" });
    } catch (error) {
      await transaction.rollback();
      console.error("Error in updateBookingStatus:", error);
      next(error);
    }
  }

  static async getAvailableEmployees(req, res, next) {
    try {
      const { providerId } = req.params;
      const { booking_id, bookingDate, start_time, end_time } = req.query;

      if (!bookingDate || !start_time || !end_time) {
        return res.status(400).json({
          message: "booking_date, start_time, and end_time are required",
        });
      }

      const booking = await Booking.findOne({
        where: { booking_id },
        include: [
          {
            model: BookingItem,
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      let highestBufferTime = 0;
      let totalBufferMinutes = 0;

      for (let bookingItem of booking.BookingItems) {
        const bufferTime = await CitySpecificBuffertime.findOne({
          where: {
            city_id: booking.city_id,
            item_id: bookingItem.item_id,
          },
        });

        if (bufferTime) {
          totalBufferMinutes =
            bufferTime.buffer_hours * 60 + bufferTime.buffer_minutes;
        } else {
          // If no any buffer times for booking items then aplying global buffer time
          const globalBufferTime = await SystemSettings.findOne({
            where: {
              category: "provider_assignment",
              key: "global_buffer_time",
            },
          });

          totalBufferMinutes = Number(
            globalBufferTime?.value ? JSON.parse(globalBufferTime.value) : 0
          );
        }

        // Track the highest buffer time across all items in the booking
        highestBufferTime = Math.max(highestBufferTime, totalBufferMinutes);
      }

      // Calculate the adjusted end time
      const adjustedEndTime = moment(end_time, "HH:mm:ss")
        .add(highestBufferTime, "minutes")
        .format("HH:mm:ss");

      const adjustedStartTime = moment(start_time, "HH:mm:ss")
        .subtract(highestBufferTime, "minutes")
        .format("HH:mm:ss");

      // loggers for debugging
      console.log("highestBufferTime:", highestBufferTime);
      console.log("startTime:", start_time);
      console.log("endTime:", end_time);
      console.log("adjustedStartTime:", adjustedStartTime);
      console.log("adjustedEndTime:", adjustedEndTime);

      // Find unavailable employees based on the adjusted times
      const unavailableEmployees = await Booking.findAll({
        attributes: ["employee_id"],
        where: {
          booking_date: bookingDate,
          [Op.and]: [
            {
              start_time: { [Op.lt]: adjustedEndTime }, // Existing booking starts before new booking ends
            },
            {
              end_time: { [Op.gt]: adjustedStartTime }, // Existing booking ends after new booking starts
            },
          ],
        },
        raw: true,
      });

      // Extract unavailable employee IDs
      let unavailableEmployeeIds = unavailableEmployees
        .map((emp) => emp.employee_id)
        .filter((id) => id !== null);

      // Build the where condition for available employees
      const whereCondition =
        unavailableEmployeeIds.length > 0
          ? {
              employee_id: { [Op.notIn]: unavailableEmployeeIds },
              provider_id: providerId,
            }
          : { provider_id: providerId };

      // Find available employees
      const availableEmployees = await ServiceProviderEmployee.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            attributes: ["name", "email", "mobile"],
          },
        ],
      });

      res.status(200).json({ availableEmployees });
    } catch (error) {
      console.error("Error in getAvailableEmployees:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async providerRejectBooking(req, res, next) {
    const { bookingId } = req.body;

    const transaction = await sequelize.transaction();

    try {
      const assignment = await AssignmentHistory.findOne({
        where: { booking_id: bookingId, status: "pending" },
        include: Booking,
      });

      if (!assignment) {
        return res
          .status(404)
          .json({ message: "Booking not found or already processed." });
      }

      await assignment.update({ status: "rejected" }, { transaction });

      console.log(`Reassigning provider for booking ${bookingId}...`);
      const newAssignedProvider = await BookingController.assignServiceProvider(
        assignment.booking_id,
        assignment?.Booking?.city_id,
        transaction
      );

      if (newAssignedProvider) {
        console.log(`New provider assigned:`, newAssignedProvider);
        await transaction.commit();
        return res.status(200).json({
          message: "Booking rejected and provider reassigned successfully.",
          newAssignedProvider,
        });
      } else {
        await transaction.commit();
        return res
          .status(400)
          .json({ message: "No available providers for reassignment." });
      }
    } catch (error) {
      await transaction.rollback();
      console.error("Rejection and reassignment failed:", error);
      return res.status(500).json({
        message:
          "An error occurred while rejecting and reassigning the booking.",
        error,
      });
    }
  }
}

module.exports = BookingController;
