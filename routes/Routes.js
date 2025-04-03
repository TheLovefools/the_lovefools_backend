const express = require("express");

const {
  Register,
  Login,
  TokenVerification,
} = require("../collection/UserAuthController");
const {
  AddReceiptData,
  UpdateReceiptData,
  GetReceiptsList,
  DeleteReceipt,
} = require("../collection/ReceiptController");
const {
  AddTableData,
  UpdateTableData,
  GetTablesList,
  DeleteTable,
  CheckTablesList,
} = require("../collection/TableController");
const {
  AddUserInformationData,
  UpdateUserInformationData,
  GetUserInformationList,
  DeleteUserInformation,
} = require("../collection/UserInformation");

const {
  AddEventData,
  UpdateEventData,
  GetEventsList,
  DeleteEvent,
} = require("../collection/EventController");
const {
  AddGalleryData,
  UpdateGalleryData,
  GetGalleryList,
  DeleteGallery,
  GetGalleryListByUser
} = require("../collection/GalleryController");
const {
  AddTestimonialData,
  UpdateTestimonialData,
  GetTestimonialList,
  DeleteTestimonial,
} = require("../collection/TestimonialController");
const {
  AddCMSData,
  UpdateCMSData,
  GetCMSList,
  DeleteCMS,
} = require("../collection/CMSController");
const {
  upload,
  replaceFileIfExists,
  getPhoto,
  DeleteImg,
} = require("../Aws/UploadPhoto");
// const uploadPhoto = require("../Aws/UploadPhoto");
const authenticateToken = require("../protectedRoute/protectedRoute");
const {
  AddOrderData,
  changeStatusOrder,
} = require("../collection/OrderController");

const {
  InitiatePayment,
  InitiatePaymentRefund,
  HandlePaymentresponse
} = require("../collection/PaymentController");

const {
  AddContactData,
  DeleteContact,
  UpdateContactData,
  GetContactList,
} = require("../collection/ContactController");

const {
  AddRoomData,
  DeleteRoom,
  UpdateRoomData,
  GetRoomList,
} = require("../collection/RoomController");

const { GetRoomsList } = require("../collection/master/Booking");

const {
  AddFloorData,
  DeleteFloor,
  UpdateFloorData,
  GetFloorList,
} = require("../collection/FloorController");
const {
  AddMenuData,
  UpdateMenuData,
  GetMenuList,
  DeleteMenu,
} = require("../collection/MenuController");
const {
  AddUpcomingEventData,
  UpdateUpcomingEventData,
  GetUpcomingEventsList,
  DeleteUpcomingEvent,
} = require("../collection/UpcomingEvent");

const {
  AddEventEnquiryData,
  UpdateEventEnquiryData,
  GetEventEnquiryList,
  DeleteEventEnquiry,
} = require("../collection/EventEnquiry");

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });
const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/protected", TokenVerification);

//Receipt module
router.post("/addReceipt", AddReceiptData);
router.post("/updateReceipt/:receiptId", UpdateReceiptData);
router.post("/getReceiptList", GetReceiptsList);
router.post("/deleteReceipt/:receiptId", DeleteReceipt);

//Payment module
router.post("/initiatePayment", InitiatePayment);
router.post("/handlePaymentResponse", HandlePaymentresponse);
router.post("/initiateRefund", InitiatePaymentRefund);

//Enquiry module
router.post("/addEnquiry", AddEventEnquiryData);
router.post("/updateEnquiry/:EventEnquiryID", UpdateEventEnquiryData);
router.post("/getEnquiry", GetEventEnquiryList);
router.post("/deleteEnquiry/:EventEnquiryID", DeleteEventEnquiry);

//Rooms User module
router.post("/getBookList", GetRoomsList);
// router.post("/getCheckBookList", CheckTablesList);

//Menu module
router.post("/addMenu", AddMenuData);
router.post("/updateMenu/:menuId", UpdateMenuData);
router.post("/getMenuList", GetMenuList);
router.post("/deleteMenu/:menuId", DeleteMenu);

//Menu module
router.post("/addRoom", AddRoomData);
router.post("/updateRoom/:roomId", UpdateRoomData);
router.post("/getRoomList", GetRoomList);
router.post("/deleteRoom/:roomId", DeleteRoom);

//Table module
router.post("/addTable", AddTableData);
router.post("/updateTable/:tableId", UpdateTableData);
router.post("/getTableList", GetTablesList);
router.post("/deleteTable/:tableId", DeleteTable);

// //Floor module
// router.post("/addFloor", AddFloorData);
// router.post("/updateFloor/:floorId", UpdateFloorData);
// router.post("/getFloorList", GetFloorList);
// router.post("/deleteFloor/:floorId", DeleteFloor);

//Table module
router.post("/addUserInformation", AddUserInformationData);
router.post(
  "/updateUserInformation/:userId",

  UpdateUserInformationData
);
router.post(
  "/getUserInformationList",

  GetUserInformationList
);
router.post(
  "/deleteUserInformation/:userId",

  DeleteUserInformation
);

//Table module
router.post("/addEvent", AddEventData);
router.post("/updateEvent/:eventId", UpdateEventData);
router.post("/getEventList", GetEventsList);
router.post("/deleteEvent/:eventId", DeleteEvent);

//Gallery module
router.post("/addGallery", AddGalleryData);
router.post("/updateGallery/:galleryId", UpdateGalleryData);
router.post("/getGalleryList", GetGalleryList);
router.post("/deleteGallery/:galleryId", DeleteGallery);
router.post("/getGalleryListByUser", GetGalleryListByUser);


//Testimonial module
router.post("/addTestimonial", AddTestimonialData);
router.post(
  "/updateTestimonial/:testimonialId",

  UpdateTestimonialData
);
router.post("/getTestimonialList", GetTestimonialList);
router.post(
  "/deleteTestimonial/:testimonialId",

  DeleteTestimonial
);
router.post("/addCMS", AddCMSData);
router.post("/updateCMS/:CMDId", UpdateCMSData);
router.post("/getCMSList", GetCMSList);
// Route to upload a photo with an ID in the URL
router.post("/upload/:id", upload.single("file"), replaceFileIfExists);

router.get("/photo/:id", getPhoto);

router.get("/getOrder", AddOrderData);
router.get("/UpdateOrder", changeStatusOrder);

router.post("/addContact", AddContactData);
router.post("/updateContact/:ContactId", UpdateContactData);
router.post("/getContactList", GetContactList);
router.post("/deleteContact/:ContactId", DeleteContact);

router.post("/addUpComingEvent", AddUpcomingEventData);
router.post(
  "/updateUpComingEvent/:upcomingEventID",

  UpdateUpcomingEventData
);
router.post("/getUpComingEventList", GetUpcomingEventsList);
router.post(
  "/deleteUpComingEvent/:upcomingEventID",

  DeleteUpcomingEvent
);
router.post("/delete-image", DeleteImg);

// router.post("/upload", upload.single("photo"), (req, res) => {
//   res.send("File uploaded successfully to " + req.file.location);
// });
module.exports = router;
