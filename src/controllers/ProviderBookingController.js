const {
  Booking,
  Service,
  ServiceType,
  SubCategory,
  Package,
  PackageSection,
  BookingItem,
  BookingPayment,
  ServiceProvider,
  User,
  ServiceItem,
  PackageItem,
  City,
  ProviderServiceCity,
  ServiceCategory,
  ServiceCommission,
  SystemSettings,
  ServiceProviderEmployee,
  sequelize,
} = require("../models");
const { Op, where } = require("sequelize");
const IdGenerator = require("../utils/helper");
const createError = require("http-errors");
const OTPHandler = require("../utils/otp.js");
const {
  StandardCheckoutPayRequest,
  OrderStatusResponse,
} = require("pg-sdk-node");
const { randomUUID } = require("crypto");
const { client } = require("../utils/phonepeClient.js");
const NotificationService = require("../services/NotificationService.js");

class ProviderBookingController {
  static async getBookingByProvider(req, res, next) {
    try {
      const { id } = req.params;

      const bookings = await Booking.findAll({
        where: { provider_id: id },
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["u_id", "name", "email", "mobile"],
          },
          {
            model: ServiceProvider,
            as: "provider",
            include: [
              {
                model: User,
                attributes: ["name", "email", "mobile"],
              },
            ],
          },
          {
            model: City,
            attributes: ["city_id", "name"],
          },
          {
            model: ServiceProviderEmployee,
            as: "employee",
            include: [
              {
                model: User,
                attributes: ["name", "email", "mobile"],
              },
            ],
          },
          {
            model: BookingItem,
            as: "BookingItems", // Ensure the alias matches the model definition
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
              },
            ],
          },
          {
            model: BookingPayment,
          },
        ],
      });

      if (!bookings || bookings.length === 0) {
        throw createError(404, "No bookings found for this provider");
      }

      // Process each booking to include `itemHierarchicalRel`
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          // Compute itemHierarchicalRel for each booking
          const itemHierarchicalRel = await Promise.all(
            (booking.BookingItems ?? []).map(async (item) => {
              let itemData = {
                categoryId: null,
                serviceId: null,
                itemId: item.item_id,
                itemType: item.item_type,
              };

              if (item.item_type === "service_item") {
                const serviceItem = await ServiceItem.findOne({
                  where: { item_id: item.item_id },
                  include: [
                    {
                      model: Service,
                      include: [
                        {
                          model: ServiceType,
                          include: [
                            {
                              model: SubCategory,
                              include: [
                                {
                                  model: ServiceCategory,
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                });

                if (
                  serviceItem?.Service?.ServiceType?.SubCategory
                    ?.ServiceCategory
                ) {
                  itemData.categoryId =
                    serviceItem.Service.ServiceType.SubCategory.ServiceCategory.category_id;
                  itemData.serviceId = serviceItem.Service.service_id;
                }
              } else if (item.item_type === "package_item") {
                const packageItem = await PackageItem.findOne({
                  where: { item_id: item.item_id },
                  include: [
                    {
                      model: PackageSection,
                      include: [
                        {
                          model: Package,
                          include: [
                            {
                              model: ServiceType,
                              include: [
                                {
                                  model: SubCategory,
                                  include: [
                                    {
                                      model: ServiceCategory,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                });

                if (
                  packageItem?.PackageSection?.Package?.ServiceType?.SubCategory
                    ?.ServiceCategory
                ) {
                  itemData.categoryId =
                    packageItem.PackageSection.Package.ServiceType.SubCategory.ServiceCategory.category_id;
                  itemData.serviceId =
                    packageItem.PackageSection.Package.package_id;
                }
              }

              return itemData;
            })
          );

          return {
            ...booking.toJSON(), // Convert Sequelize instance to plain object
            itemHierarchicalRel,
          };
        })
      );

      res.status(200).json(enrichedBookings);
    } catch (error) {
      console.error("Error in getBookingByProvider:", error);
      next(error);
    }
  }

  static async bookingSendOTP(req, res, next) {
    try {
      console.log(req.body);
      const { mobile, bookingId, userId } = req.body;

      if (!mobile) {
        throw createError(400, "Mobile number is required");
      }

      if (!bookingId) {
        throw createError(400, "Booking Id is required");
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      const otp = OTPHandler.generateOTP();

      // Get Socket.IO instance
      const io = req.app.get("io");

      const roomName = `booking-${userId}`;
      const sockets = await io.in(roomName).fetchSockets();
      console.log(`Active sockets in room ${roomName}:`, sockets.length);

      // Emit to room
      io.to(roomName).emit("otp-generated", {
        bookingId,
        otp,
        mobile,
        expiresIn: 300,
      });

      console.log(`OTP ${otp} sent to room ${roomName}`);
      console.log(`OTP for ${mobile}:`, otp);

      await booking.update({
        otp,
        otp_expires: new Date(Date.now() + 5 * 60 * 1000),
      });

      await NotificationService.createNotification({
        userId: userId,
        type: "booking",
        title: "Your Booking Verification Code",
        message: `Your One-Time Password (OTP) for starting the booking is ${otp}. This code is valid for 5 minutes. Please do not share it with anyone.`,
      });

      res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async bookingVerifyOTP(req, res, next) {
    try {
      const { otp, bookingId } = req.body;

      if (!bookingId || !otp) {
        throw createError(400, "Booking Id and OTP are required");
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      if (!booking.otp || booking.otp !== otp) {
        throw createError(400, "Invalid OTP");
      }

      if (new Date() > new Date(booking.otp_expires)) {
        throw createError(400, "OTP has expired");
      }

      await booking.update({
        otp: null,
        otp_expires: null,
        status: "in_progress",
      });

      res.json({
        success: true,
        message: "OTP verified successfully And Booking In Progress",
      });
    } catch (error) {
      next(error);
    }
  }

  static async bookingEditSendOTP(req, res, next) {
    try {
      console.log(req.body.addOns);
      const { mobile, bookingId, userId, addOns } = req.body;

      if (!mobile) {
        throw createError(400, "Mobile number is required");
      }

      if (!addOns || addOns.length === 0) {
        throw createError(400, "Add-ons are required");
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
        include: BookingPayment,
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      // Generate OTP
      const otp = OTPHandler.generateOTP();
      console.log(`OTP for ${mobile}:`, otp);

      // Calculate total price and prepare item details
      let totalPrice = 0;
      let subTotal = 0;
      let prevPaid = 0;
      let itemDetails = addOns
        .map((item) => {
          let price =
            parseFloat(item.SpecialPricing) ||
            parseFloat(item.CitySpecificPr) ||
            parseFloat(item.base_price);
          totalPrice += price;
          return `- ${item.name}: ${price.toFixed(2)}`;
        })
        .join("\n");

      const prevPaymentStatus = booking?.BookingPayment.payment_status;
      const prevTotal = parseFloat(booking?.BookingPayment.total_amount);
      const prevAdvance = parseFloat(booking?.BookingPayment.advance_payment);

      const taxAmount = totalPrice * 0.18;
      const totalWithTax = totalPrice + taxAmount;

      if (prevPaymentStatus === "completed") {
        subTotal = totalWithTax;
        prevPaid = prevTotal;
      } else if (prevPaymentStatus === "advance_only_paid") {
        subTotal = prevTotal + totalWithTax - prevAdvance;
        prevPaid = prevTotal - prevAdvance;
      } else if (prevPaymentStatus === "pending") {
        subTotal = prevTotal + totalWithTax;
        prevPaid = 0;
      }

      // Construct message
      const customerMessage = `Dear Customer, you have added new services to your booking:\n\n${itemDetails}\n\n Total: ${totalPrice.toFixed(
        2
      )}\n Total With Tax: ${totalWithTax.toFixed(
        2
      )}\n\nPrevious Bill: ${prevTotal.toFixed(
        2
      )}\nPrevious Paid: ${prevPaid.toFixed(
        2
      )}\nNew Total With Tax: ${totalWithTax.toFixed(
        2
      )}\nTotal Payable: ${subTotal.toFixed(2)}\n\nYour OTP is: ${otp}`;

      // Get Socket.IO instance
      const io = req.app.get("io");

      const roomName = `booking-${userId}`;
      const sockets = await io.in(roomName).fetchSockets();
      console.log(`Active sockets in room ${roomName}:`, sockets.length);

      // Emit to room
      io.to(roomName).emit("otp-generated", {
        bookingId,
        customerMessage,
        otp,
        mobile,
        expiresIn: 300,
      });

      console.log(`OTP ${otp} sent to room ${roomName}`);
      console.log(customerMessage);

      await NotificationService.createNotification({
        userId: userId,
        type: "booking",
        title: "New Items Adding To Your Booking Verification Code",
        message: `${customerMessage}`,
      });

      // Update booking with OTP
      await booking.update({
        otp,
        otp_expires: new Date(Date.now() + 5 * 60 * 1000),
      });

      res.json({
        success: true,
        message: "OTP sent successfully",
        details: customerMessage,
      });
    } catch (error) {
      next(error);
    }
  }

  static async bookingEditVerifyOTP(req, res, next) {
    try {
      const { otp, bookingId, addOns } = req.body;

      console.log(req.body);

      if (!bookingId || !otp) {
        throw createError(400, "Booking Id and OTP are required");
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      if (!booking.otp || booking.otp !== otp) {
        throw createError(400, "Invalid OTP");
      }

      if (new Date() > new Date(booking.otp_expires)) {
        throw createError(400, "OTP has expired");
      }

      const globalItemCommiton = await SystemSettings.findOne({
        where: {
          key: "booking_custom_item_commition_rate",
        },
      });

      let globalCommiton = parseFloat(globalItemCommiton.value);

      // Process and insert add-ons into booking_items table
      let totalAmount = 0;
      let totalCommition = 0;
      let commition = 0;

      if (addOns && addOns.length > 0) {
        const bookingItems = addOns.map((addOn) => {
          const unit_price =
            parseFloat(addOn.SpecialPricing) ||
            parseFloat(addOn.CitySpecificPr) ||
            parseFloat(addOn.base_price);

          totalAmount = totalAmount + unit_price;

          const serviceCommition = ServiceCommission.findOne({
            where: { city_id: booking.city_id, item_id: addOn.item_id },
          });

          if (serviceCommition) {
            commition =
              (parseFloat(serviceCommition?.commission_rate) / 100) *
              unit_price;
          }
          if (globalCommiton > 0) {
            commition = (unit_price * globalCommiton) / 100;
          }

          totalCommition = totalCommition + commition;

          console.log(totalCommition);

          return {
            booking_id: booking.booking_id,
            item_id: addOn.item_id,
            item_type: "service_item",
            quantity: 1,
            unit_price: unit_price,
            total_price: unit_price * 1,
            advance_payment: 0,
            service_commition: commition || 0,
          };
        });

        // Insert add-ons into booking_items table
        await BookingItem.bulkCreate(bookingItems);
      }

      const taxAmount = totalAmount * 0.18;
      const totalWithTax = totalAmount + taxAmount;

      const existingPaymentIds = await BookingPayment.findAll({
        attributes: ["payment_id"],
      });

      await BookingPayment.create({
        payment_id: IdGenerator.generateId(
          "PAY",
          existingPaymentIds.map((p) => p.payment_id)
        ),
        booking_id: bookingId,
        payment_method: "cash",
        payment_status: "pending",
        subtotal: totalAmount,
        tax_amount: taxAmount,
        total_amount: totalWithTax,
        advance_payment: 0,
        tip_amount: 0,
        service_commition: totalCommition || 0,
        transaction_id: null,
        payment_date: null,
        payment_response: null,
      });

      await booking.update({
        otp: null,
        otp_expires: null,
      });

      res.json({
        success: true,
        message: "OTP verified successfully and add-ons stored",
      });
    } catch (error) {
      next(error);
    }
  }

  static async providerStopOngoingBooking(req, res, next) {
    try {
      const { mobile, bookingId, userId } = req.body;

      console.log(req.body);
      if (!bookingId) {
        throw createError(400, "Booking Id is required");
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      // Fetch all payments for the booking
      const bookingPayments = await BookingPayment.findAll({
        where: { booking_id: bookingId },
      });

      if (!bookingPayments.length) {
        throw createError(400, "No payments found for this booking");
      }

      // Check if all payments are completed
      const allPaymentsCompleted = bookingPayments.every(
        (payment) => payment.payment_status === "completed"
      );

      if (!allPaymentsCompleted) {
        throw createError(400, "Payment is not completed for this booking");
      }

      const otp = OTPHandler.generateOTP();
      console.log("Otp: ", otp);

      // Get Socket.IO instance
      const io = req.app.get("io");

      const roomName = `booking-${userId}`;
      const sockets = await io.in(roomName).fetchSockets();
      console.log(`Active sockets in room ${roomName}:`, sockets.length);

      // Emit to room
      io.to(roomName).emit("otp-generated", {
        bookingId,
        otp,
        mobile,
        expiresIn: 300,
      });

      console.log(`OTP ${otp} sent to room ${roomName}`);

      console.log(`OTP for ${mobile}:`, otp);

      await NotificationService.createNotification({
        userId: userId,
        type: "booking",
        title: "Booking Completion Verification Code",
        message: `Your One-Time Password (OTP) to complete the booking is ${otp}. This code is valid for 5 minutes. Please do not share it with anyone.`,
      });

      await booking.update({
        otp,
        otp_expires: new Date(Date.now() + 5 * 60 * 1000),
      });

      res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async providerStopOngoingBookingVerify(req, res, next) {
    try {
      const { otp, bookingId } = req.body;

      if (!bookingId || !otp) {
        throw createError(400, "Booking Id and OTP are required");
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      if (!booking.otp || booking.otp !== otp) {
        throw createError(400, "Invalid OTP");
      }

      if (new Date() > new Date(booking.otp_expires)) {
        throw createError(400, "OTP has expired");
      }

      if (booking.status !== "in_progress") {
        throw createError(400, "Booking not started");
      }

      await booking.update({
        otp: null,
        otp_expires: null,
        status: "completed",
      });

      res.json({
        success: true,
        message: "OTP verified successfully And Booking Completed",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOngoingBookingPayment(req, res, next) {
    try {
      const providerId = req.params.id;

      if (!providerId) {
        throw createError(400, "Provider Id is required");
      }

      const booking = await Booking.findOne({
        where: {
          provider_id: providerId,
          status: "in_progress",
        },
      });

      if (!booking) {
        return res.status(200).json({ message: "No ongoing Booking found" });
      }

      const bookingPayments = await BookingPayment.findAll({
        where: { booking_id: booking.booking_id },
      });

      res.status(200).json({ booking: booking, payment: bookingPayments });
    } catch (error) {
      next(error);
    }
  }

  static async getOngoingEmployeeBookingPayment(req, res, next) {
    try {
      const providerId = req.params.id;

      if (!providerId) {
        throw createError(400, "Provider Id is required");
      }

      const booking = await Booking.findOne({
        where: {
          employee_id: providerId,
          status: "in_progress",
        },
      });

      if (!booking) {
        return res.status(200).json({ message: "No ongoing Booking found" });
      }

      const bookingPayments = await BookingPayment.findAll({
        where: { booking_id: booking.booking_id },
      });

      res.status(200).json({ booking: booking, payment: bookingPayments });
    } catch (error) {
      next(error);
    }
  }

  static async collectOngoingBookingPayment(req, res, next) {
    try {
      const bookingId = req.params.id;
      const { providerId } = req.body;

      if (!providerId) {
        throw createError(400, "Provider Id is required");
      }

      if (!bookingId) {
        throw createError(400, "Booking Id is required");
      }

      const [updatedCount] = await BookingPayment.update(
        {
          payment_status: "completed",
          cash_collected_by: providerId,
          payment_method: "cash",
        },
        {
          where: {
            booking_id: bookingId,
            payment_status: {
              [Op.or]: ["advance_only_paid", "pending"],
            },
          },
        }
      );

      if (updatedCount === 0) {
        return res.status(404).json({ message: "No matching payments found" });
      }

      res
        .status(200)
        .json({ message: "Payments updated successfully", updatedCount });
    } catch (error) {
      next(error);
    }
  }

  static async getProviderBookingPaymentHistory(req, res, next) {
    try {
      const providerId = req.params.id;

      const payments = await BookingPayment.findAll({
        where: {
          cash_collected_by: providerId,
          payment_status: "completed",
        },
      });

      if (!payments) {
        return res.status(404).json({ message: "No matching payments found" });
      }

      res.status(200).json({ payments });
    } catch (error) {
      next(error);
    }
  }

  static async getProviderDailyPayouts(req, res, next) {
    try {
      const today = new Date().toISOString().split("T")[0];

      if (!req.user || !req.user.id) {
        console.log("No user ID found in request");
        throw createError(401, "User not authenticated");
      }

      const provider = await ServiceProvider.findOne({
        where: { user_id: req.user.id },
      });

      const bookings = await Booking.findAll({
        where: {
          booking_date: today,
          status: "completed",
          provider_id: provider.provider_id,
        },
        include: [
          {
            model: BookingItem,
          },
        ],
      });

      let dailyTotal = 0;

      const result = await Promise.all(
        bookings.map(async (booking) => {
          let totalPayable = 0;

          const bookingPayments = await BookingPayment.findAll({
            where: { booking_id: booking.booking_id },
          });

          if (bookingPayments && bookingPayments.length > 0) {
            bookingPayments.forEach((payment) => {
              const serviceComm = parseFloat(payment.service_commition || 0);
              const taxAmount = parseFloat(payment.tax_amount || 0);

              if (payment.payment_method === "card") {
                const totalAmount = parseFloat(payment.total_amount || 0);
                totalPayable =
                  totalPayable - (totalAmount - serviceComm - taxAmount);

                console.log(totalPayable);
              } else if (payment.payment_method === "cash") {
                const advance = parseFloat(payment.advance_payment || 0);
                if (advance > 0) {
                  totalPayable =
                    totalPayable - (advance - serviceComm - taxAmount);
                } else {
                  totalPayable += serviceComm + taxAmount;
                }
              }
            });

            dailyTotal += totalPayable;
          }

          return {
            ...booking.toJSON(),
            totalPayable: totalPayable.toFixed(2),
          };
        })
      );

      res.status(200).json({ result, dailyTotal: dailyTotal.toFixed(2) });
    } catch (error) {
      next(error);
    }
  }

  static async getProviderDuePayouts(req, res, next) {
    try {
      const today = new Date().toISOString().split("T")[0];

      const bookings = await Booking.findAll({
        where: {
          booking_date: {
            [Op.lt]: today,
          },
        },
        include: [
          {
            model: BookingItem,
          },
        ],
      });

      let dueTotal = 0;

      const result = await Promise.all(
        bookings.map(async (booking) => {
          let totalPayable = 0;

          const bookingPayments = await BookingPayment.findAll({
            where: { booking_id: booking.booking_id },
          });

          if (bookingPayments && bookingPayments.length > 0) {
            bookingPayments.forEach((payment) => {
              const serviceComm = parseFloat(payment.service_commition || 0);
              const taxAmount = parseFloat(payment.tax_amount || 0);

              if (payment.payment_method === "card") {
                const totalAmount = parseFloat(payment.total_amount || 0);
                totalPayable =
                  totalPayable - (totalAmount - serviceComm - taxAmount);

                console.log(totalPayable);
              } else if (payment.payment_method === "cash") {
                const advance = parseFloat(payment.advance_payment || 0);
                if (advance > 0) {
                  totalPayable =
                    totalPayable - (advance - serviceComm - taxAmount);
                } else {
                  totalPayable += serviceComm + taxAmount;
                }
              }
            });

            dueTotal += dueTotal;
          }

          return {
            ...booking.toJSON(),
            totalPayable: totalPayable.toFixed(2),
          };
        })
      );

      res.status(200).json({ result, dueTotal: dueTotal.toFixed(2) });
    } catch (error) {
      next(error);
    }
  }

  static async processSettleProviderPayouts(req, res, next) {
    if (!req.user || !req.user.id) {
      console.log("No user ID found in request");
      throw createError(401, "User not authenticated");
    }

    const { amount } = req.body;

    const rawAmount = parseFloat(amount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const convertedAmount = Math.round(rawAmount * 100);

    const provider = await ServiceProvider.findOne({
      where: { user_id: req.user.id },
    });

    try {
      const merchantOrderId = `TXN_PAYOUT_${
        provider.provider_id
      }_${Date.now()}`;

      const redirectUrl = `http://localhost:3000/payment/payout/${merchantOrderId}`;

      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(convertedAmount)
        .redirectUrl(redirectUrl)
        .build();

      try {
        const response = await client.pay(request);
        const checkoutPageUrl = response.redirectUrl;
        console.log("Redirect user to:", checkoutPageUrl);
        return res.status(200).json({ success: true, checkoutPageUrl });
      } catch (error) {
        console.error("Payment initiation failed:", error);
      }
    } catch (error) {
      next(error);
    }
  }

  static async verifyProviderDailyPayoutPayment(req, res, next) {
    if (!req.user || !req.user.id) {
      console.log("No user ID found in request");
      return next(createError(401, "User not authenticated"));
    }

    try {
      const { merchantOrderId, date } = req.body;

      const today = new Date().toISOString().split("T")[0];
      const statusResponse = await client.getOrderStatus(merchantOrderId);
      const status = statusResponse.state;

      if (status !== "COMPLETED") {
        return res
          .status(400)
          .json({ success: false, message: "Payment not successful", status });
      }

      const provider = await ServiceProvider.findOne({
        where: { user_id: req.user.id },
      });

      const bookings = await Booking.findAll({
        where: {
          provider_id: provider.provider_id,
          booking_date: today,
        },
      });

      for (const booking of bookings) {
        const bookingPayments = await BookingPayment.findAll({
          where: { booking_id: booking.booking_id },
        });

        for (const payment of bookingPayments) {
          console.log(
            `Updating payment ID ${payment.payment_id} with status 'paid_by_provider'`
          );

          payment.update({
            commition_status: "paid_by_provider",
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Commission paid successfully.",
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
}

module.exports = ProviderBookingController;
