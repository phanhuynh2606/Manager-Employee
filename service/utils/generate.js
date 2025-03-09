const mongoose = require("mongoose");
const employee = require("../models/employee");
const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
const generateUsername = async (fullName) => {
  const nameParts = fullName.split(" "); 
  const count = await employee.countDocuments(); 
  console.log(nameParts.length);
  if(nameParts.length == 1){
    return fullname + (count + 1);
  }
  const firstNameInitial = nameParts[nameParts.length - 1] 
    .toLowerCase(); 
  let otherInitials = "";
  for (let i = 0; i < nameParts.length - 1; i++) {
    otherInitials += nameParts[i].charAt(0).toLowerCase();
  } 
  const baseUsername = firstNameInitial + otherInitials;  
  return baseUsername + (count + 1);
};
module.exports = { generatePassword, generateUsername};
