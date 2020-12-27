//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistdb", {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect("mongodb+srv://admin-mitesh:miteshad@1096@cluster0.ebwgb.mongodb.net/todolistdb", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({name: "wake up"});
const item2 = new Item({name: "eat"});
const item3 = new Item({name: "drink"});

const defaultArray = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {
    if(err) {
      console.log(err);
    } else {

      if(foundItems.length === 0) {
        
        Item.insertMany(defaultArray, (err) => {
          if(err){
            console.log(err);
          } else {
            console.log("successfully saved to database");
          }
        });

        res.redirect("/")

      } else {

        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }


      
    }
  })


});

app.post("/", function(req, res){

  const newItemCaught = req.body.newItem;
  const newList = req.body.list;

  const addItem = new Item({name: newItemCaught});

  if(newList === "Today")
  {
    addItem.save();
    res.redirect("/");
  } else {

    List.findOne({name: newList}, (err, foundList)=>{
      if(!err){
        foundList.items.push(addItem);
        foundList.save();
        res.redirect("/"+ newList);
      }
    })
  }
  
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checked
  const listName = req.body.listName
  console.log(itemId);
  console.log(listName);

  if(listName === "Today"){
    Item.findByIdAndDelete(itemId, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("successfully deleted");
      }
    })
    res.redirect("/");
  }
  else
  {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, (err, results)=>{
          if(!err){
            console.log(results);
            res.redirect("/"+ listName);
          }
      })
  }
  
});

app.get("/:customList", (req, res) => {
  const customListName = _.capitalize(req.params.customList);


  List.findOne({name: customListName}, (err, foundCustomList)=>{
      if(foundCustomList)
      {
        res.render("list", {listTitle: customListName, newListItems: foundCustomList.items})
      }
      else {
        const item = new List({
          name: customListName,
          items: defaultArray
        })
        item.save();
        res.redirect("/"+customListName);
      }
  })
  
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
