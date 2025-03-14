 const buildTreeSelect = (data) => {
  const departmentMap = {};
  const tree = [];

  // Tạo các phòng ban và ánh xạ theo ID
  data.forEach(item => {
    const departmentId = item.departmentId._id;
    if (!departmentMap[departmentId]) {
      departmentMap[departmentId] = {
        value: departmentId,
        title: item.departmentId.name,
        children: []
      };
      tree.push(departmentMap[departmentId]);
    }
  });

   // Thêm nhân viên vào từng phòng ban
   data.forEach(item => {
      const departmentId = item.departmentId._id; 
      departmentMap[departmentId].children.push({
         value: item._id,
         title: `${item.fullName}${item?.roler?.startsWith("Trưởng") ? ' - Trưởng phòng' : ''}`,
         email: item.userId?.email || 'No email',
         position: item.position,
         roler: item.roler,
         avatarUrl: item.avatarUrl || '/assets/images/avatar-default.png'
      });
   });

  return tree;
}

export default buildTreeSelect;