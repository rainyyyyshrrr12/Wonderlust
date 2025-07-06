const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  country: String,
  image: {
  url: String,
  filename: String
},

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref: "User",
  },

});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
