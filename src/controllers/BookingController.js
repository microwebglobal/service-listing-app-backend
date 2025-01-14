const { 
    Booking,
    BookingItem,
    BookingPayment,
    ServiceItem,
    PackageItem,
    CitySpecificPricing,
    SpecialPricing
  } = require("../models");
  const { Op } = require("sequelize");
  const IdGenerator = require("../utils/helper");
  
  class BookingController {
    static isValidTimeSlot(time) {
      const validStartHour = 11;
      const validEndHour = 20;
      const minutes = parseInt(time.split(':')[1]);
      const hour = parseInt(time.split(':')[0]);
      
      return (hour >= validStartHour && 
              hour <= validEndHour && 
              (minutes === 0 || minutes === 30) &&
              !(hour === validEndHour && minutes === 30));
    }
  
    static calculateTotalDuration(items) {
      return items.reduce((total, item) => {
        const duration = item.duration_hours * 60 + item.duration_minutes;
        return total + (duration * item.quantity);
      }, 0);
    }
  
    static async getCurrentPrice(itemId, itemType, cityId) {
      const currentDate = new Date();
      
      const specialPricing = await SpecialPricing.findOne({
        where: {
          item_id: itemId,
          item_type: itemType,
          city_id: cityId,
          status: 'active',
          start_date: { [Op.lte]: currentDate },
          end_date: { [Op.gte]: currentDate }
        }
      });
  
      if (specialPricing) {
        return specialPricing.special_price;
      }
  
      const cityPricing = await CitySpecificPricing.findOne({
        where: {
          item_id: itemId,
          item_type: itemType,
          city_id: cityId
        }
      });
  
      if (cityPricing) {
        return cityPricing.price;
      }
  
      const Model = itemType === 'service_item' ? ServiceItem : PackageItem;
      const item = await Model.findByPk(itemId);
      return itemType === 'service_item' ? item.base_price : item.price;
    }
  
    static async addToCart(req, res, next) {
      try {
        const { 
          cityId, 
          items, 
          bookingDate, 
          startTime,
          serviceAddress,
          serviceLocation,
          customerNotes 
        } = req.body;
  
        if (!this.isValidTimeSlot(startTime)) {
          return res.status(400).json({ 
            message: "Invalid time slot. Please select a time between 11:00 AM and 8:30 PM in 30-minute intervals" 
          });
        }
  
        let booking = await Booking.findOne({
          where: {
            user_id: req.user.u_id,
            status: 'cart'
          }
        });
  
        if (!booking) {
          const existingBookings = await Booking.findAll({
            attributes: ['booking_id']
          });
  
          const newBookingId = IdGenerator.generateId(
            "BKG",
            existingBookings.map(booking => booking.booking_id)
          );
  
          booking = await Booking.create({
            booking_id: newBookingId,
            user_id: req.user.u_id,
            city_id: cityId,
            booking_date: bookingDate,
            start_time: startTime,
            end_time: startTime, 
            status: 'cart',
            service_address: serviceAddress,
            service_location: serviceLocation,
            customer_notes: customerNotes
          });
        }
  
        let totalAmount = 0;
        for (const item of items) {
          const currentPrice = await this.getCurrentPrice(
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
            total_price: totalPrice
          });
        }
  
        await BookingPayment.create({
          payment_id: IdGenerator.generateId("PAY", []),
          booking_id: booking.booking_id,
          subtotal: totalAmount,
          tax_amount: totalAmount * 0.18, 
          total_amount: totalAmount * 1.18,
          payment_status: 'pending'
        });
  
        const updatedBooking = await Booking.findByPk(booking.booking_id, {
          include: [
            { model: BookingItem },
            { model: BookingPayment }
          ]
        });
  
        res.status(200).json(updatedBooking);
  
      } catch (error) {
        console.error("Add to Cart Error:", error);
        next(error);
      }
    }
  
    static async getCart(req, res, next) {
      try {
        const cart = await Booking.findOne({
          where: {
            user_id: req.user.u_id,
            status: 'cart'
          },
          include: [
            { 
              model: BookingItem,
              include: [
                {
                  model: ServiceItem,
                  required: false
                },
                {
                  model: PackageItem,
                  required: false
                }
              ]
            },
            { model: BookingPayment }
          ]
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
  
    static async updateTip(req, res, next) {
      try {
        const { tipAmount } = req.body;
  
        const booking = await Booking.findOne({
          where: {
            user_id: req.user.u_id,
            status: 'cart'
          },
          include: [{ model: BookingPayment }]
        });
  
        if (!booking) {
          return res.status(404).json({ message: "No active cart found" });
        }
  
        const payment = booking.BookingPayment;
        const newTotalAmount = payment.subtotal + payment.tax_amount + tipAmount;
  
        await payment.update({
          tip_amount: tipAmount,
          total_amount: newTotalAmount
        });
  
        res.status(200).json({ 
          message: "Tip updated successfully",
          payment: await payment.reload()
        });
  
      } catch (error) {
        console.error("Update Tip Error:", error);
        next(error);
      }
    }
  
    static async updateCartItem(req, res, next) {
      try {
        const { itemId, quantity } = req.body;
  
        const booking = await Booking.findOne({
          where: {
            user_id: req.user.u_id,
            status: 'cart'
          }
        });
  
        if (!booking) {
          return res.status(404).json({ message: "No active cart found" });
        }
  
        const bookingItem = await BookingItem.findOne({
          where: {
            booking_id: booking.booking_id,
            item_id: itemId
          }
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
            total_price: newTotalPrice
          });
        }
  
        const allItems = await BookingItem.findAll({
          where: { booking_id: booking.booking_id }
        });
  
        const subtotal = allItems.reduce((sum, item) => sum + item.total_price, 0);
        const payment = await BookingPayment.findOne({
          where: { booking_id: booking.booking_id }
        });
  
        await payment.update({
          subtotal,
          tax_amount: subtotal * 0.18,
          total_amount: (subtotal * 1.18) + payment.tip_amount
        });
  
        res.status(200).json({ 
          message: "Cart updated successfully",
          booking: await booking.reload({
            include: [
              { model: BookingItem },
              { model: BookingPayment }
            ]
          })
        });
  
      } catch (error) {
        console.error("Update Cart Item Error:", error);
        next(error);
      }
    }
  
    static async proceedToPayment(req, res, next) {
      try {
        const booking = await Booking.findOne({
          where: {
            user_id: req.user.u_id,
            status: 'cart'
          },
          include: [{ model: BookingPayment }]
        });
  
        if (!booking) {
          return res.status(404).json({ message: "No active cart found" });
        }
  
        await booking.update({ status: 'payment_pending' });
        
        res.status(200).json({
          message: "Booking ready for payment",
          booking: await booking.reload({
            include: [
              { model: BookingItem },
              { model: BookingPayment }
            ]
          })
        });
  
      } catch (error) {
        console.error("Proceed to Payment Error:", error);
        next(error);
      }
    }
  }
  
  module.exports = BookingController;