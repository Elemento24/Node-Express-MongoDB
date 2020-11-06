class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // ====================================
    // 1) BUILD THE QUERY -> (A) FILTERING
    // ====================================
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // =============================================
    // 1) BUILD THE QUERY -> (B) ADVANCED FILTERING
    // =============================================
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // ===========
    // 2) SORTING
    // ===========
    if (this.queryString.sort) {
      // This is for the case when the user specifies some Field as the Basis for Sorting
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // This is the DEFAULT case when the user doesn't specify any field, so we sort them by the Time they were created at, so the one which is the latest, will appear first.
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // ==================
    // 3) FIELD LIMITING
    // ==================
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // We are excluding this Field, cause this field is just used by Mongoose
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // ==================
    // 3) PAGINATION
    // ==================
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // We will skip the SKIP number of results, and we are going to limit the number of results upto the value of LIMIT, and we have also defined the default values for both of these.
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};

module.exports = APIFeatures;