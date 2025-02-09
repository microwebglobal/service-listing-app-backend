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
  ProviderServiceCategory,
  ServiceCategory,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const createError = require("http-errors");

class AdminBookingController {
  static async getAllBookings(req, res, next) {
    try {
      const { status, dateRange, search, cityId, page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;

      let whereClause = {};

      // Add status filter if provided
      if (status && status !== "all") {
        whereClause.status = status;
      }

      // Add city filter if provided
      if (cityId) {
        whereClause.city_id = cityId;
      }

      // Add date filter if provided
      if (dateRange) {
        switch (dateRange) {
          case "today":
            whereClause.booking_date = sequelize.literal("CURRENT_DATE");
            break;
          case "week":
            whereClause.booking_date = {
              [Op.gte]: sequelize.literal("CURRENT_DATE - INTERVAL '7 days'"),
            };
            break;
          case "month":
            whereClause.booking_date = {
              [Op.gte]: sequelize.literal("CURRENT_DATE - INTERVAL '30 days'"),
            };
            break;
        }
      }

      const totalBookings = await Booking.count({ where: whereClause });

      const bookings = await Booking.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["u_id", "name", "email", "mobile"],
            required: false,
            where: search
              ? {
                  [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { mobile: { [Op.iLike]: `%${search}%` } },
                  ],
                }
              : undefined,
          },
          {
            model: ServiceProvider,
            as: "provider",
            required: false,
            include: [
              {
                model: User,
                attributes: ["name", "email", "mobile"],
              },
            ],
          },
          {
            model: City,
            required: false,
            attributes: ["city_id", "name"],
          },
          {
            model: BookingItem,
            required: false,
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
            required: false,
          },
        ],
        order: [
          ["booking_date", "DESC"],
          ["start_time", "DESC"],
        ],
        limit,
        offset,
      });

      const serviceItemIds = [];
      const packageItemIds = [];

      // Extract item_ids from BookingItems
      bookings.forEach((booking) => {
        booking.BookingItems.forEach((item) => {
          if (item.item_type === "service_item") {
            serviceItemIds.push(item.item_id);
          } else if (item.item_type === "package_item") {
            packageItemIds.push(item.item_id);
          }
        });
      });

      // Fetch ServiceItems with Category ID (for Service Items)
      const serviceItemsWithCategory = await ServiceItem.findAll({
        where: { item_id: serviceItemIds },
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
                        attributes: ["category_id"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Fetch PackageItems with Category ID (for Package Items)
      const packageItemsWithCategory = await PackageItem.findAll({
        where: { item_id: packageItemIds },
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
                            attributes: ["category_id"],
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

      // Map service item category_ids
      const serviceCategoryMap = serviceItemsWithCategory.reduce(
        (acc, serviceItem) => {
          acc[serviceItem.item_id] =
            serviceItem.Service?.ServiceType?.SubCategory?.category_id || null;
          return acc;
        },
        {}
      );

      // Map package item category_ids
      const packageCategoryMap = packageItemsWithCategory.reduce(
        (acc, packageItem) => {
          acc[packageItem.item_id] =
            packageItem.PackageSection?.Package?.ServiceType?.SubCategory
              ?.category_id || null;
          return acc;
        },
        {}
      );

      // Attach category_ids to each booking item
      bookings.forEach((booking) => {
        booking.BookingItems.forEach((item) => {
          let categoryId = null;

          if (item.item_type === "service_item") {
            categoryId = serviceCategoryMap[item.item_id];
          } else if (item.item_type === "package_item") {
            categoryId = packageCategoryMap[item.item_id];
          }

          item.setDataValue("category_id", categoryId);
        });

        // Collect category IDs for each booking
        let allCategoryIds = new Set();
        booking.BookingItems.forEach((item) => {
          if (item.category_id) allCategoryIds.add(item.category_id);
        });

        booking.setDataValue("catId", Array.from(allCategoryIds));
      });

      const totalPages = Math.ceil(totalBookings / limit);

      res.status(200).json({
        bookings,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
    } catch (error) {
      console.error("Error in getAllBookings:", error);
      next(error);
    }
  }

  static async getServiceProviders(req, res, next) {
    try {
      const { search, cityId, categoryId } = req.query;

      const includeClause = [
        {
          model: User,
          attributes: ["name", "email", "mobile"],
          required: true,
          where: search
            ? {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${search}%` } },
                  { mobile: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : {},
        },
        {
          model: City,
          as: "serviceCities",
          required: cityId ? true : false,
          where: cityId ? { city_id: cityId } : {},
          through: { attributes: [] },
        },
      ];

      // Add category filter if provided
      if (categoryId) {
        includeClause.push({
          model: ServiceCategory,
          as: "serviceCategories",
          required: true,
          where: { category_id: categoryId },
          through: { attributes: [] },
          attributes: ["category_id", "name"],
        });
      }

      const providers = await ServiceProvider.findAll({
        where: {
          status: "active",
        },
        include: includeClause,
        attributes: [
          "provider_id",
          "business_name",
          "business_type",
          "availability_type",
          "availability_hours",
          "primary_location",
          "years_experience",
          "languages_spoken",
          "specializations",
        ],
        order: [[{ model: User }, "name", "ASC"]],
      });

      res.status(200).json(providers);
    } catch (error) {
      console.error("Error in getServiceProviders:", error);
      next(error);
    }
  }

  static async getBookingById(req, res, next) {
    try {
      const { id } = req.params;

      const booking = await Booking.findOne({
        where: { booking_id: id },
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
              },
            ],
          },
          {
            model: BookingPayment,
          },
        ],
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      res.status(200).json(booking);
    } catch (error) {
      console.error("Error in getBookingById:", error);
      next(error);
    }
  }

  static async assignServiceProvider(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { providerId } = req.body;

      // Get booking details with items
      const booking = await Booking.findOne({
        where: { booking_id: id },
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
              },
            ],
          },
        ],
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      // Get service categories from booking items
      const categoryIds = new Set();
      for (const item of booking.BookingItems) {
        if (item.serviceItem) {
          // For service items, traverse the relationship to get category
          const service = await ServiceItem.findOne({
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
          if (service?.Service?.ServiceType?.SubCategory?.category_id) {
            console.log(
              service?.Service?.ServiceType?.SubCategory?.category_id
            );
            categoryIds.add(
              service.Service.ServiceType.SubCategory.category_id
            );
          }
        } else if (item.packageItem) {
          // Similar traversal for package items
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
              ?.category_id
          ) {
            console.log(
              packageItem.PackageSection.Package.ServiceType.SubCategory
                .category_id
            );
            categoryIds.add(
              packageItem.PackageSection.Package.ServiceType.SubCategory
                .category_id
            );
          }
        }
      }
      console.log([...categoryIds]);
      // Get provider details with category and city verification
      const provider = await ServiceProvider.findOne({
        where: {
          provider_id: providerId,
          status: "active",
        },
        include: [
          {
            model: User,
            attributes: ["name", "email", "mobile"],
          },
          {
            model: ProviderServiceCity,
            as: "providerCities",
            where: { city_id: booking.city_id },
            required: true,
          },
          {
            model: ProviderServiceCategory,
            as: "providerCategories",
            where: {
              category_id: {
                [Op.in]: Array.from(categoryIds),
              },
            },
            required: true,
          },
        ],
      });

      if (!provider) {
        throw createError(
          404,
          "Service provider not found or does not serve this city/category"
        );
      }

      // Check provider's service radius
      const cityServiceInfo = await ProviderServiceCity.findOne({
        where: {
          provider_id: providerId,
          city_id: booking.city_id,
        },
      });
      if (booking.service_location && provider.primary_location) {
        const distance = sequelize.literal(`
            ST_Distance(
              ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${booking.service_location}'), 4326), 2163),
              ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${provider.primary_location}'), 4326), 2163)
            ) / 1000
          `);

        if (distance > cityServiceInfo.service_radius) {
          throw createError(
            400,
            "Service location is outside provider's service radius for this city"
          );
        }
      }

      // Check provider's availability
      const availabilityData =
        typeof provider.availability_hours === "string"
          ? JSON.parse(provider.availability_hours)
          : provider.availability_hours;

      const dayMapping = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const bookingTime = new Date(
        `${booking.booking_date} ${booking.start_time}`
      );
      const dayOfWeek = dayMapping[bookingTime.getDay()];
      const timeOfDay = booking.start_time;

      const availability = availabilityData
        ? availabilityData[dayOfWeek]
        : null;

      const isAvailable =
        availability?.isOpen &&
        timeOfDay >= availability.start &&
        timeOfDay <= availability.end;

      if (!isAvailable) {
        throw createError(
          400,
          "Service provider is not available at this time slot"
        );
      }

      // Check for existing bookings
      const existingBooking = await Booking.findOne({
        where: {
          provider_id: providerId,
          booking_date: booking.booking_date,
          status: {
            [Op.in]: ["assigned", "in_progress"],
          },
          [Op.or]: [
            {
              start_time: {
                [Op.between]: [booking.start_time, booking.end_time],
              },
            },
            {
              end_time: {
                [Op.between]: [booking.start_time, booking.end_time],
              },
            },
          ],
        },
        transaction,
      });

      if (existingBooking) {
        throw createError(
          400,
          "Service provider has another booking at this time slot"
        );
      }

      // Assign the provider
      await booking.update(
        {
          provider_id: providerId,
          status: "assigned",
        },
        { transaction }
      );

      await transaction.commit();

      // Get updated booking
      const updatedBooking = await Booking.findOne({
        where: { booking_id: id },
        include: [
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
        ],
      });

      res.status(200).json(updatedBooking);
    } catch (error) {
      await transaction.rollback();
      console.error("Error in assignServiceProvider:", error);
      next(error);
    }
  }

  static async updateBookingStatus(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const booking = await Booking.findOne({
        where: { booking_id: id },
        include: [
          {
            model: BookingPayment,
            required: false,
          },
        ],
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      const validStatusTransitions = {
        cart: ["payment_pending", "cancelled"],
        payment_pending: ["confirmed", "cancelled"],
        confirmed: ["assigned", "cancelled"],
        assigned: ["in_progress", "cancelled"],
        in_progress: ["completed", "cancelled"],
        completed: ["refunded"],
        cancelled: [],
        refunded: [],
      };

      if (!validStatusTransitions[booking.status]?.includes(status)) {
        throw createError(
          400,
          `Invalid status transition from ${booking.status} to ${status}`
        );
      }

      const updates = {
        status,
        customer_notes: notes
          ? `${booking.customer_notes || ""}\n${notes}`
          : booking.customer_notes,
      };

      if (status === "cancelled") {
        Object.assign(updates, {
          cancellation_reason: notes || "Cancelled by admin",
          cancelled_by: "admin",
          cancellation_time: new Date(),
        });

        // Handle refund if payment exists
        if (
          booking.BookingPayment &&
          booking.BookingPayment.payment_status === "completed"
        ) {
          await booking.BookingPayment.update(
            {
              payment_status: "refunded",
              refund_amount: booking.BookingPayment.total_amount,
              refund_status: "completed",
            },
            { transaction }
          );
        }
      }

      await booking.update(updates, { transaction });
      await transaction.commit();

      const updatedBooking = await Booking.findOne({
        where: { booking_id: id },
        include: [
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
            model: BookingPayment,
          },
        ],
      });

      res.status(200).json(updatedBooking);
    } catch (error) {
      await transaction.rollback();
      console.error("Error in updateBookingStatus:", error);
      next(error);
    }
  }
}

module.exports = AdminBookingController;
