
const Employee = require("../models/employee");
const generatePassword = () => {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChar = "@"; 
  let password = "";
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length)); 
  password += specialChar; 
  const allChars = uppercaseChars + lowercaseChars + numberChars;
  for (let i = 0; i < 4; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  } 
  return shuffleString(password);
}; 
const shuffleString = (str) => {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];  
  }
  return array.join('');
};
const generateUsername = async (fullName) => {
  const nameParts = fullName.split(" "); 
  const count = await Employee.countDocuments(); 
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
  const employee = await Employee.find({ username });
  if (employee.length === 0) {
    return username;
  }else{
    return username + employee.length
  }
};
module.exports = { generatePassword, generateUsername,getUsernameFromEmail};
