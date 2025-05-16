const {
  ProviderServiceCategory,
  Booking,
  ServiceProvider,
  ServiceProviderEmployee,
} = require("../models");
const { Op } = require("sequelize");

class BookingAvailabilityService {
  static async checkAvailableSlots(req, res, next) {
    const { items, date } = req.body;
    try {
      if (!items?.length || !date) {
        throw new Error("Invalid input: items and date are required");
      }

      const normalizedDate = new Date(date).toISOString().split("T")[0];

      const timeSlots = generateTimeSlots();
      const slotAvailability = timeSlots.map((time) => ({
        time,
        status: "available",
      }));

      const providerSet = new Set();
      const providers = [];

      let slotCapacity = 0;
      for (const item of items) {
        const { item_id, type } = item;
        const itemProviders = await findProvidersForItem(item_id, type);
        for (const provider of itemProviders) {
          if (!providerSet.has(provider.provider_id)) {
            providerSet.add(provider.provider_id);
            providers.push(provider);
          }
        }
      }

      // Calculate total capacity
      let totalCapacity = 0;
      for (const provider of providers) {
        const capacity = await getProviderCapacity(provider);
        totalCapacity += capacity;
        console.log(capacity);
      }

      console.log("Provider", totalCapacity);

      // Get all bookings for these providers on the given date
      const bookings = await Booking.findAll({
        where: {
          provider_id: {
            [Op.in]: providers.map((p) => p.provider_id),
          },
          booking_date: normalizedDate,
        },
        attributes: ["booking_date", "start_time", "end_time"],
      });

      // Count bookings per time slot across all providers
      const slotCounts = {};
      for (const booking of bookings) {
        const bookingStart = new Date(`2000-01-01T${booking.start_time}`);
        const bookingEnd = new Date(`2000-01-01T${booking.end_time}`);

        for (const slot of timeSlots) {
          const slotTime = new Date(`2000-01-01T${slot}`);
          if (slotTime >= bookingStart && slotTime < bookingEnd) {
            slotCounts[slot] = (slotCounts[slot] || 0) + 1;
          }
        }
      }

      // Mark slots as unavailable if total bookings reach total capacity
      slotAvailability.forEach((slot) => {
        if ((slotCounts[slot.time] || 0) >= totalCapacity) {
          slot.status = "not available";
        }
      });

      return slotAvailability;
    } catch (error) {
      throw new Error(`Error checking available slots: ${error.message}`);
    }
  }
}

async function findProvidersForItem(itemId, type) {
  let providers = [];

  const idAsString = String(itemId);

  if (type === "service_item") {
    providers = await ProviderServiceCategory.findAll({
      where: { item_id: idAsString },
      include: [{ model: ServiceProvider }],
    });
  } else if (type === "package_item") {
    providers = await ProviderServiceCategory.findAll({
      where: { package_id: idAsString },
      include: [{ model: ServiceProvider }],
    });
  }

  console.log(providers);

  return providers.map((p) => p.ServiceProvider);
}

async function getProviderCapacity(provider) {
  if (provider.business_type === "individual") {
    return 1;
  }

  const employeeCount = await ServiceProviderEmployee.count({
    where: {
      provider_id: provider.provider_id,
    },
  });

  return Math.max(employeeCount, 1);
}

function generateTimeSlots() {
  const slots = [];
  let hours = 8;
  let minutes = 0;

  while (hours <= 18) {
    const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:00`;
    slots.push(time);

    minutes += 30;
    if (minutes >= 60) {
      hours += 1;
      minutes = 0;
    }
  }

  return slots;
}

module.exports = BookingAvailabilityService;
