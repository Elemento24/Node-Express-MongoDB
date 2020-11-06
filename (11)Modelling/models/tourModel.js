const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Tour must have a Name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A Tour Name must have less or equal than 40 Characters'],
    minlength: [10, 'A Tour Name must have more or equal than 10 Characters'],
    // validate: [validator.isAlpha, 'Tour Name must only contain Characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A Tour must have a Duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A Tour must have a Group Size']
  },
  difficulty: {
    type: String,
    required: [true, 'A Tour must have a Difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is Either: easy, medium or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: val => (Math.round(val * 10)) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A Tour must have a Price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // THIS keyword only points to Current Doc on NEW document creation.
        return val < this.price;
      },
      message: 'Discount Price ({VALUE}) must be below the Regular Price',
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A Tour must have a Summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A Tour must have a Cover Image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: ['Point'],
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Creating a Simple Index
// tourSchema.index({ price: 1 });

// Creating a Compound Index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// ======================================================================
// DOCUMENT MIDDLEWARE: Runs before only .save() and .create() commands.
// ======================================================================

// We call this a Document Middleware, cause in this function, we have access to the Document that is being currently processed. Also, here the THIS keyword refers to the Document that is being processed
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// This is how we Embed Documents inside of another Document. However, in this case we are going to use Referencing, because if the User let's say update his role from GUIDE to LEAD GUIDE, in that case, we will have to first query for tours, which have that user as the Guide, and then change that in all the tours.
// Since we are using Asynchronous function, so it will return a Promise, so we will basically get an Array of Promises. 
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save Document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// =================
// QUERY MIDDLEWARE
// =================

// We are using a Regular Expression to make sure that this hook works for all the FIND related Queries. Here, the THIS keyword refers to the Query that is being processed.
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start}ms`);
  next();
});

// =======================
// AGGREGATION MIDDLEWARE
// =======================

// Here the THIS keyword refers to the Aggregate, that is being processed.
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } }
//   });

//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;