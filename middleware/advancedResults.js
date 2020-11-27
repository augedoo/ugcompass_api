const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  console.log(req.query);

  // > Copy req.query
  const reqQuery = { ...req.query };
  // > Fields to exclude
  const removeFields = ['select', 'order_by', 'page', 'per_page'];
  // > Loop over remove fields and delete from reqQeury
  removeFields.forEach((param) => delete reqQuery[param]);
  // > Create query string
  let queryStr = JSON.stringify(reqQuery);
  // > Create search operators like [gt, gte, in,  lt, lte] in the  query params
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // > Finding resource
  query = model.find(JSON.parse(queryStr));

  // > Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // > Sort
  if (req.query.order_by) {
    const orderBy = req.query.order_by.split(',').join(' ');
    query = query.sort(orderBy);
  } else {
    query = query.sort('-createdAt');
  }

  // > Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const per_page = parseInt(req.query.per_page, 10) || 15;
  const startIndex = (page - 1) * per_page;
  const endIndex = page * per_page;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(per_page);

  if (populate) {
    const fieldsToPopulate = populate.split(' ') //split fields to populate into array
    query = query.populate(fieldsToPopulate);
  }

  // > Execute query
  const results = await query;

  // > Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      per_page,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      per_page,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
