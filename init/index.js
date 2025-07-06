const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing =require("./models/listing.js");
const mongourl="mongodb://127.0.0.1:27017/wonderlust";

main().then(()=>{
    console.log("db is running");
})
.catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect(mongourl);
}

const initdb = async () => {
    await Listing.deleteMany({});
    const ownerId = new mongoose.Types.ObjectId("6520081ae547c5d37e56b5fd"); // must match a User's _id
    initdata.data = initdata.data.map((obj) => ({
        ...obj,
        owner: ownerId,
    }));

    await Listing.insertMany(initdata.data);
    console.log("data was initialized.");
};

main().catch(err => console.log(err)); 

