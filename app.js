//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash"); //require lodash
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const db = 'mongodb+srv://amin-Pritam:Pritam@#32@cluster0.hg4szdo.mongodb.net/todolistDB?retryWrites=true&w=majority';

// mongoose.connect(db,{
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedToplogy: true,
//   useFindAndModify: false
// }).then(()=>{
//   console.log('connection successfull');
// }).catch((err)=>console.log('no connection'));

mongoose.connect("mongodb+srv://amin-Pritam:jXEKIi6spbEVlfDv@cluster0.hg4szdo.mongodb.net/todolistDB");

const itemSchema = {
  name:String
};

const Item = mongoose.model("Item",itemSchema);

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

const item1 = new Item({
  name:"Welcome..."
});

const item2 = new Item({
  name:"Welcome 2..."
});

const item3 = new Item({
  name:"Welcome 3..."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name:String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

//const day = date.getDate();

Item.find({ },function(err,foundItems){
  //console.log(foundItems);

  if(foundItems.length === 0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfull...");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

});
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName); //use lodash method of first letter uppercase

List.findOne({name: customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      //create a new list
      const list = new List({
        name: customListName,
        items:defaultItems
      });

      list.save();
      res.redirect("/"+ customListName);
    }else{
      //show the exesting list

      res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    //inside the default list
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfull");
        res.redirect("/");
      }
    });
  }else{
    // we are in custom list
    List.findOneAndUpdate({name: listName},{ $pull: {items: {_id: checkedItemId}}},function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


// let port = process.env.PORT;
// if(port === null || port === ""){
//   port = 3000;
// }

// app.listen(port);

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started");
});
