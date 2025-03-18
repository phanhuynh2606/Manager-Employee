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
const getUsernameFromEmail = async(email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email');
  }
  const username = email.split('@')[0];
  const employee = await employee.find({ username });
  if (employee.length === 0) {
    return username;
  }else{
    return username + employee.length
  }
};
module.exports = { generatePassword, generateUsername,getUsernameFromEmail};
