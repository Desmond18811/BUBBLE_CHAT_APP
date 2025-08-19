// controllers/contactController.js
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Contact from "../models/Contacts.js";
import Message from "../models/Messages.js"; // <-- import Message model

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const { userId } = req;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Search query is required"
      });
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { email: { $regex: q, $options: "i" } },
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } }
          ]
        },
        { _id: { $ne: userId } }
      ]
    })
      .select("-password -__v")
      .limit(10);

    const existingContacts = await Contact.find({
      userId,
      contactId: { $in: users.map(u => u._id) }
    });

    const contactMap = existingContacts.reduce((map, contact) => {
      map[contact.contactId.toString()] = contact.status;
      return map;
    }, {});

    const results = users.map(user => ({
      ...user.toObject(),
      contactStatus: contactMap[user._id.toString()] || "none"
    }));

    return res.status(200).json({
      status: "success",
      data: results
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export const addContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    const { userId } = req;

    if (!contactId) {
      return res.status(400).json({
        status: "error",
        message: "Contact ID is required"
      });
    }

    const existingContact = await Contact.findOne({
      userId,
      contactId
    });

    if (existingContact) {
      return res.status(409).json({
        status: "error",
        message: "Contact already exists"
      });
    }

    const contact = await Contact.create({
      userId,
      contactId,
      status: "pending"
    });

    return res.status(201).json({
      status: "success",
      data: contact
    });
  } catch (error) {
    console.error("Add contact error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export const getContactsForDMList = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      { $unwind: "$contactInfo" },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      contacts,
    });
  } catch (error) {
    console.error("getContactsForDMList error:", error);
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};





// // controllers/contactController.js
// import User from "../models/UserModel.js";
// import Contact from "../models/Contacts.js";

// export const searchUsers = async (req, res) => {
//   try {
//     const { q } = req.query;
//     const { userId } = req;

//     if (!q || q.trim() === "") {
//       return res.status(400).json({
//         status: "error",
//         message: "Search query is required"
//       });
//     }

//     // Search users (excluding current user and existing contacts)
//     const users = await User.find({
//       $and: [
//         { 
//           $or: [
//             { email: { $regex: q, $options: "i" } },
//             { firstName: { $regex: q, $options: "i" } },
//             { lastName: { $regex: q, $options: "i" } }
//           ]
//         },
//         { _id: { $ne: userId } } // Exclude current user
//       ]
//     })
//     .select("-password -__v")
//     .limit(10);

//     // Check which users are already contacts
//     const existingContacts = await Contact.find({
//       userId,
//       contactId: { $in: users.map(u => u._id) }
//     });

//     const contactMap = existingContacts.reduce((map, contact) => {
//       map[contact.contactId.toString()] = contact.status;
//       return map;
//     }, {});

//     // Add contact status to each user
//     const results = users.map(user => ({
//       ...user.toObject(),
//       contactStatus: contactMap[user._id.toString()] || "none"
//     }));

//     return res.status(200).json({
//       status: "success",
//       data: results
//     });

//   } catch (error) {
//     console.error("Search error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error"
//     });
//   }
// };

// export const addContact = async (req, res) => {
//   try {
//     const { contactId } = req.body;
//     const { userId } = req;

//     if (!contactId) {
//       return res.status(400).json({
//         status: "error",
//         message: "Contact ID is required"
//       });
//     }

//     // Check if contact already exists
//     const existingContact = await Contact.findOne({
//       userId,
//       contactId
//     });

//     if (existingContact) {
//       return res.status(409).json({
//         status: "error",
//         message: "Contact already exists"
//       });
//     }

//     // Create new contact request
//     const contact = await Contact.create({
//       userId,
//       contactId,
//       status: "pending"
//     });

//     return res.status(201).json({
//       status: "success",
//       data: contact
//     });

//   } catch (error) {
//     console.error("Add contact error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error"
//     });
//   }
// };


// export const getContactsForDMList = async (req, res) => {
//   try {
//     const userId = new mongoose.Types.ObjectId(req.userId);

//     const contacts = await Message.aggregate([
//       {
//         $match: {
//           $or: [{ sender: userId }, { recipient: userId }],
//         },
//       },
//       {
//         $sort: { timestamp: -1 }, // assumes your Message schema has "timestamp"
//       },
//       {
//         $group: {
//           _id: {
//             $cond: {
//               if: { $eq: ["$sender", userId] },
//               then: "$recipient",
//               else: "$sender",
//             },
//           },
//           lastMessageTime: { $first: "$timestamp" },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "contactInfo",
//         },
//       },
//       {
//         $unwind: "$contactInfo",
//       },
//       {
//         $project: {
//           _id: 1,
//           lastMessageTime: 1,
//           email: "$contactInfo.email",
//           firstName: "$contactInfo.firstName",
//           lastName: "$contactInfo.lastName",
//           image: "$contactInfo.image",
//           color: "$contactInfo.color",
//         },
//       },
//       {
//         $sort: { lastMessageTime: -1 },
//       },
//     ]);

//     return res.status(200).json({
//       status: "success",
//       statusCode: 200,
//       contacts,
//     });
//   } catch (error) {
//     console.error("getContactsForDMList error:", error);
//     return res.status(500).json({
//       status: "error",
//       statusCode: 500,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

//     try {
//   let userId = req 
//   userId = new mongoose.Types.ObjectId(userId)
//   const contacts  = await Message.aggregate([
//     {
//         $match: {
//              $or:[{sender: userId}, {recipient:userId}]
//         },
//     },
//       {
//         $sort: {timestamp: -1},
//       },
//       {$group:{
//         _id: {
//             $cond: {
//                 if: {$eq: ["$sender", userId]},
//                 then: "$recipient",
//                 else: "$sender"
//             },
//         },
//         lastMessageTime: {$first: $timestamp},
//       }, 
//     },
//     {$lookup: {
//         from: "users",
//         localField:"_id",
//         foreignField: "_id",
//         as: "contactInfo"
//     },
//    },
//    {
//     $unwind: "$contactInfo"
//    },
//    {
//     $project: {
//         _id: 1,
//         lastMessageTime: 1,
//         email: "$contactInfo.email", 
//         firstName: "$contactInfo.firstName",
//         lastName: "$contactInfo.lastName",
//         image: "$contactInfo.image",
//         color: "$contactInfo.color",
//     },
//    },
//    {
//     $sort: {lastMessageTime: -1}
//    }
// ])
//     return res.status(200).json({
//       status: "Success",
//       statusCode: 200,
//       message: "success",
//       messages,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       statusCode: 500,
//       error: error.message,
//     });
//   }
// };