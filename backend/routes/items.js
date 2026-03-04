//this route is for testItem, and is temporary for now.

const express = require("express")
const router = express.Router()
//model that we are going ot be using.
const TestComponent = require("../models/testComponent")
//permissions
const verifyToken = require("../middleware/authMiddleware")

//Pass item

router.post("/dashboard", async (req, res) => {
  try {
    //first extrat
    const {name, description, color} = req.body
    //wrap it in a new Item iteration of testComponent
    const newItem = new TestComponent({name, description, color})
    await newItem.save()
    console.log("Item saved", newItem)
    res.status(201).json({message: "Saved item."})
    //desctructure the content
    // const {name, description, colour} = req.body
    // const {}
    // await newItem.save.
  } catch (e) {
    console.warn("issue saving item", e)
  }
})

//get item
router.get("/dashboard", async (req, res) => {
  try {
    const items = await TestComponent.find()
    res.json(items)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})
module.exports = router
//need this to prevent crash

//reference form assignment

// POST ROUTE (protected - only logged in users)
// router.post("/", verifyToken, async (req, res) => {
//   const plant = new Plant({
//     commonName: req.body.commonName,
//     family: req.body.family,
//     category: req.body.category,
//     origin: req.body.origin,
//     climate: req.body.climate,
//     imgUrl: req.body.imgUrl,
//   });

//   try {
//     const newPlant = await plant.save();
//     res.status(201).json(newPlant);
//     console.log(newPlant);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// DELETE ROUTE (protected - only logged in users)
// router.delete("/:id", verifyToken, async (req, res) => {
//   try {
//     await Plant.findByIdAndDelete(req.params.id);
//     res.json({ message: "Plant deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
