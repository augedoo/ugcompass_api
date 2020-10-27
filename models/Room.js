const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;

const RoomSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      maxlength: [50, 'Name can not be more than 50 characters'],
      unique: true,
      trim: true,
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters'],
      trim: true,
    },
    address: String,
    photos: {
      type: [String],
      required: [true, 'Please add at least one photo'],
      default: ['no-photo.jpg'],
      validate: [validatePhotosLength, 'Can not add more than three photos'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters'],
    },
    facility: {
      type: mongoose.Types.ObjectId,
      ref: 'Facility',
      require: true,
    },
  },
  { timestamps: true }
);

// validation number of photos to upload validation
function validatePhotosLength(val) {
  return val.length <= 3;
}

// Create place slug from the name
RoomSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Room', RoomSchema);
