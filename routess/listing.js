const express = require("express");
const router = express.Router();
const Listing =require("../models/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudconfig.js");
const upload = multer({ storage });

router.get("/", async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("listings/index", { alllistings });
});

  router.get("/new",(req,res)=>{
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl; // Store the URL to redirect after login
        req.flash("error", "You must be logged in to create a listing");
        return res.redirect("/login");
    }
  res.render("listings/new");
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author", strictPopulate: false } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  console.log("Listing Owner ID:", listing.owner?._id);
  console.log("Current User ID:", req.user?._id);

  const isOwner = req.user && listing.owner && listing.owner._id.equals(req.user._id);

  console.log("Is Owner:", isOwner);

  res.render("listings/show", { listing, isOwner });
});

// Create a new listing
router.post("/", upload.single("listing[image]"), async (req, res) => {
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;

  if (req.file) {
    newlisting.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await newlisting.save();
  req.flash("success", "Listing created successfully");
  res.redirect("/listings");
});





    
    router.get("/:id/edit",async (req,res)=>{
      let { id } = req.params;
      const listingData = await Listing.findById(id);
      res.render("listings/edit.ejs",{listing:listingData});
    });
    
    router.put("/:id", upload.single("listing[image]"), async (req, res) => {
  try {
    const { id } = req.params;
    
    let listing = await Listing.findById(id).populate("owner");
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    if (!listing.owner._id.equals(req.user._id)) {
      req.flash("error", "You do not have permission to edit this listing.");
      return res.redirect(`/listings/${id}`);
    }

    // Update listing data
    const updatedData = req.body.listing;
    if (req.file) {
      updatedData.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await Listing.findByIdAndUpdate(id, updatedData);

    req.flash("success", "Listing updated successfully.");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while updating the listing.");
  }
});
    
    router.delete("/:id",async(req,res)=>{
      let { id } = req.params;
      let listing = await Listing.findById(id).populate("owner");
if (!listing.owner._id.equals(req.user._id)) {
  req.flash("error", "You do not have permission to edit this listing.");
  return res.redirect(`/listings/${id}`);
}
     let deleted= await Listing.findByIdAndDelete(id);
     console.log(deleted);
     req.flash("success","Listing deleted successfully");
     res.redirect("/listings");
    });

   
    
    module.exports = router;