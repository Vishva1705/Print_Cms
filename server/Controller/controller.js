





//-----------------update code 12-08-2024--------------------



// src/controllers/controller.js
const pool = require('../database/db');
const { Buffer } = require('buffer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');



// Function to encode text to Base64
function encodeToBase64(text) {
  const buffer = Buffer.from(text, 'utf-8');
  return buffer.toString('base64');
}

function decodeFromBase64(base64Text) {
  try {
    const buffer = Buffer.from(base64Text, 'base64');
    return buffer.toString('utf-8');
  } catch (err) {
    console.error('Error decoding Base64:', err);
    return base64Text;
  }
}


function isBase64(str) {
  if (typeof str !== 'string' || str.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(str)) {
    return false;
  }
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (err) {
    return false;
  }
}


//---Function to form a Image tag for total xml---------


async function ImageCaption(imagename, imagecaption, foldername) {
  const splitImage = imagename.split('~');
  const splitCaption = imagecaption.split('/n');

  let totalImageTag = '';

  for (let i = 0; i < splitImage.length; i++) {
    const image = splitImage[i];
    const caption = splitCaption[i] || '';

    // Construct the image tag with caption
    const imageTag = `<Image href='file:///D:/EditorialImage/${foldername}/HighRes/${image}' /><cutline><span>${caption}</span></cutline>`;

    totalImageTag += imageTag;
  }

  return totalImageTag;
}


// --------- Get Zone Code ---------
async function Zone_Code(zoneName) {
  try {
    const query = "SELECT Zone_Code FROM parent_zone_mapping WHERE Zone_Name = ?";
    const [rows] = await pool.query(query, [zoneName]);
    return rows.length > 0 ? rows[0].Zone_Code : null;
  } catch (error) {
    console.error('Error in ZoneCode:', error);
    throw new Error('Failed to retrieve Zone_Code');
  }
}

exports.Zone_Name_api = async (req, res) => {
  const { zoneCode } = req.body;
  try {
    const query = "SELECT Zone_Name FROM parent_zone_mapping WHERE Zone_Code=?";
    const [rows] = await pool.query(query, [zoneCode]);

    if (rows.length > 0) {
      res.status(200).json(rows[0].Zone_Name);
    } else {
      res.status(404).json({ error: 'Zone_Code not found' });
    }
  } catch (error) {
    console.error('Error in Zone_Code_api:', error);
    res.status(500).json({ error: 'Failed to retrieve Zone_Code' });
  }
};


// Get Product ID
async function product_Id(productname) {
  try {
    const query = 'SELECT Product_Id FROM mas_product WHERE Product_Name = ?';
    const [rows] = await pool.query(query, [productname]);
    return rows.length > 0 ? rows[0].Product_Id : null;
  } catch (error) {
    console.error('Error fetching product ID:', error);
    throw new Error('Failed to retrieve Product_Id');
  }
}

exports.product_name_api = async (req, res) => {
  const { Product_Id } = req.body;
  try {
    const query = 'SELECT Product_Name FROM mas_product WHERE Product_Id = ?';
    const [rows] = await pool.query(query, [Product_Id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0].Product_Name);
    } else {
      res.status(404).json({ error: 'Product_Code not found' });
    }
  } catch (error) {
    console.error('Error in Zone_Code_api:', error);
    res.status(500).json({ error: 'Failed to retrieve Zone_Code' });
  }
}


// Get User ID
async function User_Id(username) {
  try {
    const query = 'SELECT User_Id FROM mas_user WHERE User_name = ?';
    const [rows] = await pool.query(query, [username]);
    return rows.length > 0 ? rows[0].User_Id : null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw new Error('Failed to retrieve User_Id');
  }
}



// Get User Name
async function User_Name(userid) {
  try {
    console.log('userid :', userid);
   
    const query = 'SELECT User_Name FROM mas_user WHERE User_Id = ?';
    const [rows] = await pool.query(query, [userid]);
    console.log('username', rows[0]?.User_Name);
   
    return rows.length > 0 ? rows[0].User_Name : null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw new Error('Failed to retrieve User_Id');
  }
}

exports.User_Id_api = async (req, res) => {
  const { username } = req.body;
  try {
    const query = 'SELECT User_Id FROM mas_user WHERE User_name = ?';
    const [rows] = await pool.query(query, [username]);
    return rows.length > 0 ? rows[0].User_Id : null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw new Error('Failed to retrieve User_Id');
  }
}



// Get XML name
const xml_name = async () => {
  try {
    const [rows] = await pool.query("SELECT MAX(ID) AS maxID FROM Persons");
    const maxID = rows[0].maxID;
    await pool.query("UPDATE Persons SET ID = ? ", [maxID + 1]);
    return maxID;
  } catch (error) {
    console.error('Error in xml_name:', error);
    throw new Error('Failed to retrieve xml_name');
  }
}




// Function to get the max ID
const getMaxID = async () => {
  const [rows] = await pool.query("SELECT MAX(ID) AS maxID FROM Persons");
  return rows[0].maxID;
};


// Setup storage configuration for multer
const getStorage = (maxID) => {
  const uploadFolderLowRes = path.join('\\\\192.168.90.32\\Images\\', `${maxID}\\LowRes`);

  // Ensure the LowRes directory is created
  fs.mkdirSync(uploadFolderLowRes, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadFolderLowRes);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${maxID}_${file.originalname}`;
      cb(null, uniqueName);
    }
  });
};


const copyFilesToHighRes = async (maxID) => {
  const uploadFolderLowRes = path.join('\\\\192.168.90.32\\Images\\', `${maxID}\\LowRes`);
  const uploadFolderHighRes = path.join('\\\\192.168.90.32\\Images\\', `${maxID}\\HighRes`);

  // Ensure the HighRes directory is created
  fs.mkdirSync(uploadFolderHighRes, { recursive: true });

  // Read all files in the LowRes folder
  const files = await fs.promises.readdir(uploadFolderLowRes);

  // Copy each file to the HighRes folder
  for (const file of files) {
    const src = path.join(uploadFolderLowRes, file);
    const dest = path.join(uploadFolderHighRes, file);
    await fs.promises.copyFile(src, dest);
  }
};




// Controller function for handling image uploads
exports.imageUploadHandler = async (req, res) => {
  try {
    const maxID = await getMaxID();
    const storage = getStorage(maxID);
    const upload = multer({ storage }).array('images');

    // Upload to LowRes folder
    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          console.error('Multer error:', err);
          return res.status(500).json({ error: 'Multer error occurred while uploading files to LowRes' });
        }
        console.error('Unknown error:', err);
        return res.status(500).json({ error: 'An unknown error occurred while uploading files to LowRes' });
      }

      try {
        // Copy files from LowRes to HighRes
        await copyFilesToHighRes(maxID);

        // Files uploaded successfully to both folders
        // console.log('Files received:', req.files);

        return res.status(200).json({ message: 'Files uploaded successfully to both LowRes and HighRes', files: req.files });
      } catch (copyError) {
        console.error('Error copying files to HighRes:', copyError);
        return res.status(500).json({ error: 'Error copying files to HighRes' });
      }
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.imageUpdateHandler = async (req, res) => {
  try {

    const xml_name = req.query.xml_name;

    if (!xml_name) {
      return res.status(200).json({ error: 'xml_name not found',});
    }

    const maxID = xml_name;
    const storage = getStorage(maxID);
    const upload = multer({ storage }).array('images');

    // Upload to LowRes folder
    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          console.error('Multer error:', err);
          return res.status(500).json({ error: 'Multer error occurred while uploading files to LowRes' });
        }
        console.error('Unknown error:', err);
        return res.status(500).json({ error: 'An unknown error occurred while uploading files to LowRes' });
      }

      try {
        // Copy files from LowRes to HighRes
        await copyFilesToHighRes(maxID);

        // Files uploaded successfully to both folders
        console.log('Files received:', req.files);

        return res.status(200).json({ message: 'Files uploaded successfully to both LowRes and HighRes', files: req.files });
      } catch (copyError) {
        console.error('Error copying files to HighRes:', copyError);
        return res.status(500).json({ error: 'Error copying files to HighRes' });
      }
    });



  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




exports.getProducts = async (req, res) => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM mas_product WHERE status = "A" ');
    res.json(rows);

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getLayouts = async (req, res) => {
  try {
    const { productName } = req.body;

    // Mapping of product names to product IDs
    const productIdMapping = {
      "Ananda Jothi": "TAMAnand",
      "Ilamai Puthumai": "TAMIlamai",
      "Hindu Tamil Thisai": "TAMILTH",
      "Impose Kalanjiam": "TAMImposeKalanjiam",
      "Imposition Penn Indru": "TAMImposePenn",
      "Kalanjiam": "TAMKalanjiam",
      "Tamkamadhenu": "TAMKam",
      "Mayabazzar": "TAMMaya",
      "Nalam Vazha": "TAMNalam",
      "Penn Indru": "TAMPenn",
      "Poster": "TAMPoster",
      "Hindu Talkies": "TAMTalky",
      "TAMTHAF": "TAMTHAF",
      "TAMTHEF": "TAMTHEF",
      "Vaniga Veethi": "TAMVani",
      "Sontha Veedu": "TAMVeedu",
      "TAMIL VETRIKODI": "TAMVKIS"
    };

    // Retrieve the product ID based on the product name
    const productId = productIdMapping[productName];

    if (!productId) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const query = `
      SELECT DISTINCT n.desk_name
      FROM desk_m n
      WHERE PRODUCT_ID = ? AND ACTIVE_STATUS = 'A'
      ORDER BY desk_name
    `;

    const [rows] = await pool.query(query, [productId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




exports.getZone = async (req, res) => {
  try {
    const [rows, fields] = await pool.query(' SELECT m.Zone_Code, m.Zone_Name FROM mas_zone m  ');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





exports.assignUser = async (req, res) => {
  try {
    let { zoneName } = req.body;
    if (!zoneName) {
      return res.status(404).json({ error: 'User not found' });
    }
    else if (zoneName == 'ALL') {
      zoneName = 'Chennai'
    }

    // const query = `SELECT u.User_name ,u.Group_Code
    // FROM mas_user u
    // JOIN mas_zone z ON u.Zone_Code = z.Zone_Code
    // WHERE z.Zone_Name = ? And u.Status='A' And u.Group_code in( 'CHRPT','SPSUBEDT','SPEDT','EDT'); `;

    // const query = `SELECT u.User_name ,u.Group_Code
    // FROM mas_user u
    // JOIN mas_zone z ON u.Zone_Code = z.Zone_Code
    // WHERE z.Zone_Name = ? And u.Status='A' And u.Depat_name in( 'News Desk', 'Reporting'); `;

    const query = `SELECT  u.Zone_Code AS User_Zone_Code, u.User_name, u.Group_Code
     FROM Mas_Zone a
     JOIN mas_user u ON u.Zone_Code LIKE CONCAT('%',a.Zone_Code,'%')
     WHERE a.Zone_Name = ?
     AND a.Status = 'A' and u.Status='A' and  u.Group_code in( 'CHRPT','SPSUBEDT','SPEDT','EDT');`

    const [rows] = await pool.query(query, [zoneName]);
    res.json(rows);

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getPageNumber = async (req, res) => {
  try {
    const { deskName } = req.body;
    if (!deskName) {
      return res.status(400).json({ error: 'deskName is required' });
    }

    const query = `SELECT d.page_id FROM desk_page_id_mas d 
                   WHERE PAGE_ID <> '' AND desk LIKE ? 
                   ORDER BY page_id`;

    const [rows] = await pool.query(query, [`%${deskName}%`]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching page numbers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.processedUser = async (req, res) => {
  const { xml_name, IssueDate, Processed_user, article_status } = req.body;

  // console.log("Received update values:", {
  //   xml_name, IssueDate, Processed_user, article_status
  // });

  try {
    const query = `
      UPDATE news_details_new
      SET
        Processed_user = '${Processed_user}',
        article_status = '${article_status}'
      WHERE
        IssueDate = '${IssueDate}' AND xml_name = '${xml_name}'
    `;
    const [result] = await pool.execute(query);
    console.log('update result:', result);

    res.status(200).json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Insert Article
// exports.insertArticle = async (req, res) => {
//   const {
//     product, layout, zone, storyto, pagename, Storyname, HeadKicker, Head, HeadDesk,
//     Byline, Dateline, paragraph, filenames, path, finalCaption, xml_parent_action, Status,
//     ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User, Assigned_USER, SP_Sub_Editor, Created_user,
//     Created_user_time, Report_User_time, Chief_Report_User_time, Editorial_User_time, SP_Editor_time, Sub_Editor_time, SP_Sub_Editor_time,
//     Processed_user, article_status
//   } = req.body;

//   console.log("Received insert values:", {
//     product, layout, zone, storyto, pagename, Storyname, HeadKicker, Head, HeadDesk,
//     Byline, Dateline, paragraph, filenames, path, finalCaption, xml_parent_action, Status,
//     ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User, Assigned_USER, SP_Sub_Editor, Created_user,
//     Created_user_time, Report_User_time, Chief_Report_User_time, Editorial_User_time, SP_Editor_time, Sub_Editor_time, SP_Sub_Editor_time,
//     Processed_user, article_status
//   });

//   try {
//     const xmlNameValue = await xml_name();
//     const parentid = xmlNameValue;
//     console.log(parentid);
//     const productId = product;

//     let zoneCode;

//     if (zone == 'ALL') {
//       zoneCode = 'ALL'
//     }
//     else {
//       zoneCode = await Zone_Code(zone);
//     }

//     const userId = await User_Id(storyto);

//     console.log("Image Filename :", filenames);
//     const ImageCaptionvalue = await ImageCaption(filenames, finalCaption, parentid);
//     console.log("Image");

//     // console.log("Final Image formation tag:",ImageCaptionvalue);

//     // if (!productId || !zoneCode || !userId) {
//     //   return res.status(400).json({ error: 'Invalid product, zone, or user' });
//     // }

//     let TotalXml = "";

//     const addXmlTag = (tag, value) => {
//       TotalXml += `<${tag}><span>${value ? value.trim() : ""}</span></${tag}>`;
//     };

//     addXmlTag("head_kicker", HeadKicker);
//     addXmlTag("head", Head);
//     addXmlTag("head_deck", HeadDesk);
//     addXmlTag("byline", Byline);
//     addXmlTag("Dateline", Dateline);
//     addXmlTag("body", paragraph);

//     // TotalXml += ImageCaptionvalue;

//     if (filenames != "" || filenames == null) {
//       console.log("Image tag formation condition meets");
//       TotalXml += ImageCaptionvalue;

//     }

//     console.log("TotalXml :", TotalXml);
//     TotalXml = encodeToBase64(TotalXml);

//     // Interpolate values into the query string for debugging
//     const query = `
//       INSERT INTO news_details_new (
//         xml_name, bkp_xml_folder_date, xml_exported_dateTime, parent_object_id, Product, desk_type, Zone_Code,
//         Created_user, Page_name, Ref_story_name, HeadKicker, Head, HeadDeck, byline, dateline, content,
//         ArticleType, news_owner, xml_parent_action, Article_Placed, quot_avail, IsPrint, IsWeb, Status,
//         IssueDate, Publication_Date,
//         Images, Image_path, caption, Image_Name, Total_Xml, Articles_Created, ArticleCreatedUser, Image_Type,
//         Chief_Report_User, Editorial_User, Report_User,Assigned_USER,Name_Caption,
//         Report_User_time,Chief_Report_User_time,Editorial_User_time,SP_Editor_time,Assign_time,SP_Sub_Editor_time,SP_Sub_Editor,Processed_user,article_status
//       ) VALUES (
//         '${xmlNameValue}', SYSDATE(), SYSDATE(), '${parentid}', '${productId}', '${layout}', '${zoneCode}',
//         '${Created_user}', '${pagename}', '${Storyname}', '${encodeToBase64(HeadKicker)}', '${encodeToBase64(Head)}','${encodeToBase64(HeadDesk)}', '${encodeToBase64(Byline)}', '${encodeToBase64(Dateline)}', '${encodeToBase64(paragraph)}',
//         'RE', 'TheHindu', '${xml_parent_action}', 'N', 'N', 'Y', 'Y', '${Status}',
//         DATE_ADD(CURDATE(), INTERVAL 1 DAY),DATE_ADD(CURDATE(), INTERVAL 1 DAY),
//         '${filenames}', '${path}', '${encodeToBase64(Created_user + '_' + Head)}', '${filenames}', '${TotalXml}',
//         '${zone}', '${ArticleCreatedUser}', 'RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~',
//         '${Chief_Report_User}', '${Editorial_User}', '${Report_User}','${Assigned_USER}','${encodeToBase64(finalCaption)}',
//         '${Report_User_time}','${Chief_Report_User_time}','${Editorial_User_time}','${SP_Editor_time}','${Sub_Editor_time}','${SP_Sub_Editor_time}','${SP_Sub_Editor}',
//         '${Processed_user}','${article_status}'
//       )
//     `;

//     // Log the query with values interpolated
//     // console.log("Query with interpolated values:", query);

//     const [result] = await pool.execute(query);
//     console.log('Insert result:', result);

//     res.status(200).json({ message: 'Article inserted successfully' });
//   } catch (error) {
//     console.error('Error inserting article news:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

exports.insertArticle = async (req, res) => {
  const {
    product, layout, zone, storyto, pagename, Storyname, HeadKicker, Head, HeadDesk,
    Byline, Dateline, paragraph, filenames, path, finalCaption, xml_parent_action, Status,
    ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User, Assigned_USER, SP_Sub_Editor, Created_user,
    Created_user_time, Report_User_time, Chief_Report_User_time, Editorial_User_time, SP_Editor_time, Sub_Editor_time, SP_Sub_Editor_time,
    Processed_user, article_status
  } = req.body;

  console.log("Received insert values:", {
    product, layout, zone, storyto, pagename, Storyname, HeadKicker, Head, HeadDesk,
    Byline, Dateline, paragraph, filenames, path, finalCaption, xml_parent_action, Status,
    ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User, Assigned_USER, SP_Sub_Editor, Created_user,
    Created_user_time, Report_User_time, Chief_Report_User_time, Editorial_User_time, SP_Editor_time, Sub_Editor_time, SP_Sub_Editor_time,
    Processed_user, article_status
  });

  try {
    const xmlNameValue = await xml_name();
    const parentid = xmlNameValue;
    console.log(parentid);
    const productId = product;

    let zoneCode;

    if (zone == 'ALL') {
      zoneCode = 'ALL'
    }
    else {
      zoneCode = await Zone_Code(zone);
    }

    const userId = await User_Id(storyto);

    console.log("Image Filename :", filenames);
    const ImageCaptionvalue = await ImageCaption(filenames, finalCaption, parentid);
    console.log("Image");

    // console.log("Final Image formation tag:",ImageCaptionvalue);

    // if (!productId || !zoneCode || !userId) {
    //   return res.status(400).json({ error: 'Invalid product, zone, or user' });
    // }

    let TotalXml = "";

    const addXmlTag = (tag, value) => {
      TotalXml += `<${tag}><span>${value ? value.trim() : ""}</span></${tag}>`;
    };

    addXmlTag("head_kicker", HeadKicker);
    addXmlTag("head", Head);
    addXmlTag("head_deck", HeadDesk);
    addXmlTag("byline", Byline);
    addXmlTag("Dateline", Dateline);
    addXmlTag("body", paragraph);

    // TotalXml += ImageCaptionvalue;

    if (filenames != "" || filenames == null) {
      console.log("Image tag formation condition meets");
      TotalXml += ImageCaptionvalue;

    }

    console.log("TotalXml :", TotalXml);
    TotalXml = encodeToBase64(TotalXml);

    // Interpolate values into the query string for debugging
    const query = `
      INSERT INTO news_details_new (
        xml_name, bkp_xml_folder_date, xml_exported_dateTime, parent_object_id, Product, desk_type, Zone_Code,
        Created_user, Page_name, Ref_story_name, HeadKicker, Head, HeadDeck, byline, dateline, content,
        ArticleType, news_owner, xml_parent_action, Article_Placed, quot_avail, IsPrint, IsWeb, Status,
        IssueDate, Publication_Date,
        Images, Image_path, caption, Image_Name, Total_Xml, Articles_Created, ArticleCreatedUser, Image_Type,
        Chief_Report_User, Editorial_User, Report_User,Assigned_USER,Name_Caption,
        Report_User_time,Chief_Report_User_time,Editorial_User_time,SP_Editor_time,Assign_time,SP_Sub_Editor_time,SP_Sub_Editor,Processed_user,article_status
      ) VALUES (
        '${xmlNameValue}', SYSDATE(), SYSDATE(), '${parentid}', '${productId}', '${layout}', '${zoneCode}',
        '${Created_user}', '${pagename}', '${Storyname}', '${encodeToBase64(HeadKicker)}', '${encodeToBase64(Head)}','${encodeToBase64(HeadDesk)}', '${encodeToBase64(Byline)}', '${encodeToBase64(Dateline)}', '${encodeToBase64(paragraph)}',
        'RE', 'TheHindu', '${xml_parent_action}', 'N', 'N', 'Y', 'Y', '${Status}',
        DATE_ADD(CURDATE(), INTERVAL 1 DAY),DATE_ADD(CURDATE(), INTERVAL 1 DAY),
        '${filenames}', '${path}', '${encodeToBase64(Created_user + '_' + Head)}', '${filenames}', '${TotalXml}',
        '${zone}', '${ArticleCreatedUser}', 'RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~',
        '${Chief_Report_User}', '${Editorial_User}', '${Report_User}','${Assigned_USER}','${encodeToBase64(finalCaption)}',
        '${Report_User_time}','${Chief_Report_User_time}','${Editorial_User_time}','${SP_Editor_time}','${Sub_Editor_time}','${SP_Sub_Editor_time}','${SP_Sub_Editor}',
        '${Processed_user}','${article_status}'
      )
    `;

    // Log the query with values interpolated
    // console.log("Query with interpolated values:", query);

    const [result] = await pool.execute(query);
    console.log('Insert result:', result);

    // res.status(200).json({ message: `Article inserted successfully ${xmlNameValue}` });
    res.status(200).json({ message: 'Article inserted successfully', xmlValue: xmlNameValue });
  } catch (error) {
    console.error('Error inserting article news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updateArticle = async (req, res) => {
  const {
    xml_name, layout, zone, storyto, pagename, Ref_story_name, HeadKicker, Head, HeadDesk,
    Byline, Dateline, paragraph, filenames, path, caption, xml_parent_action, Status,
    ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User, product, IssueDate, finalCaption,
    SP_Editor, Assigned_USER, SP_Sub_Editor, approved_datetime,
    Created_user_time, Report_User_time, Chief_Report_User_time, Editorial_User_time, SP_Editor_time, Sub_Editor_time, SP_Sub_Editor_time, Assign_time,
    Processed_user, article_status
  } = req.body;

  // console.log("Received update values:", {
  //   product, layout, zone, storyto, pagename, Ref_story_name, HeadKicker, Head, HeadDesk,
  //   Byline, Dateline, paragraph, filenames, path, caption, xml_parent_action, Status,
  //   ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User, IssueDate, finalCaption,
  //   SP_Editor, Assigned_USER, SP_Sub_Editor, approved_datetime, Assign_time,
  //   Processed_user,article_status
  // });

  try {
    const productId = product;

    let zoneCode;

    if (zone == 'ALL') {
      zoneCode = 'ALL'
      // console.log('condition meets');
    } else {
      zoneCode = await Zone_Code(zone);
    }

    const userId = await User_Id(storyto);

    const finalCaptionString = Array.isArray(finalCaption) ? finalCaption.join(' ') : finalCaption;

    const updateCaption = (finalCaptionString && finalCaptionString.trim() !== "") ? finalCaptionString : caption;

    const ImageCaptionvalue = await ImageCaption(filenames, updateCaption, xml_name);
    // console.log("Final Image formation tag :", ImageCaptionvalue);

    let TotalXml = "";

    const addXmlTag = (tag, value) => {
      TotalXml += `<${tag}><span>${value ? value.trim() : ""}</span></${tag}>`;
    };

    addXmlTag("head_kicker", HeadKicker);
    addXmlTag("head", Head);
    addXmlTag("head_deck", HeadDesk);
    addXmlTag("byline", Byline);
    addXmlTag("Dateline", Dateline);
    addXmlTag("body", paragraph);

    // Append Image captions only if filenames exist
    if (filenames && filenames.trim() !== "") {
      TotalXml += ImageCaptionvalue;
    }

    TotalXml = encodeToBase64(TotalXml);

    const query = `
      UPDATE news_details_new 
      SET 
        Product = '${productId}', 
        desk_type = '${layout}', 
        Zone_Code = '${zoneCode}', 
        Page_name = '${pagename}', 
        Ref_story_name = '${Ref_story_name}', 
        HeadKicker = '${encodeToBase64(HeadKicker)}', 
        Head = '${encodeToBase64(Head)}',
        HeadDeck = '${encodeToBase64(HeadDesk)}', 
        byline = '${encodeToBase64(Byline)}', 
        dateline = '${encodeToBase64(Dateline)}', 
        content = '${encodeToBase64(paragraph)}',  
        xml_parent_action = '${xml_parent_action}', 
        Status = '${Status}', 
        caption = '${encodeToBase64(Head)}', 
        Total_Xml = '${TotalXml}', 
        Articles_Created = '${zone}', 
        ArticleCreatedUser = '${ArticleCreatedUser}', 
        Chief_Report_User = '${Chief_Report_User}', 
        Editorial_User = '${Editorial_User}', 
        Report_User = '${Report_User}',
        SP_Editor ='${SP_Editor}',
        Assigned_USER='${Assigned_USER}',
        SP_Sub_Editor='${SP_Sub_Editor}',
        approved_datetime= SYSDATE(),
        Name_Caption='${encodeToBase64(updateCaption)}',
        Report_User_time='${Report_User_time}',
        Chief_Report_User_time='${Chief_Report_User_time}',
        Editorial_User_time='${Editorial_User_time}',
        SP_Editor_time='${SP_Editor_time}',
        Assign_time='${Assign_time}',
        SP_Sub_Editor_time = '${SP_Sub_Editor_time}',
        Processed_user='${Processed_user}',
        article_status='${article_status}',
        Images ='${filenames}',
        Image_Name ='${filenames}'
      WHERE 
        IssueDate = '${IssueDate}' And xml_name = '${xml_name}'
    `;

    const [result] = await pool.execute(query);
    console.log('update result:', result);

    res.status(200).json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}




exports.getNewsById = async (req, res) => {
  const { newsid, issuedate } = req.body;
  console.log(newsid);

  try {
    // Fetch only necessary columns and add pagination
    const query = `SELECT * FROM news_details_new WHERE parent_object_id = ? AND IssueDate = ?`;
    const [rows] = await pool.query(query, [newsid, issuedate]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    // List of fields that need to be decoded
    const fieldsToDecode = ['Total_Xml', 'HeadKicker', 'Head', 'HeadDeck', 'byline', 'dateline', 'content', 'caption', 'Name_Caption'];

    // Decode specified Base64 encoded fields in each row
    const decodedRows = rows.map(row => {
      const decodedRow = { ...row }; // Copy original row
      fieldsToDecode.forEach(field => {
        if (row[field] && isBase64(row[field])) {
          decodedRow[field] = decodeFromBase64(row[field]);
        }
      });
      return decodedRow;
    });

    res.json(decodedRows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getImageName = async (req, res) => {
  try {
    const folderName = await getMaxID();
    const input_folder = path.join(`\\\\192.168.90.32\\Images\\${folderName}\\LowRes`);
    const folder_path = `Images//${folderName}//LowRes/`;

    // Check if the directory exists
    if (!fs.existsSync(input_folder)) {
      return res.status(200).json({ message: 'Folder does not exist', filenames: '', path: folder_path });
    }

    // Read the files in the folder
    fs.readdir(input_folder, (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return res.status(500).json({ error: 'Error reading folder' });
      }

      if (files.length === 0) {
        return res.status(200).json({ message: 'Images not exist', filenames: '', path: folder_path });
      }

      // Combine filenames using ~ if there's more than one file
      let fileres = files.length > 1 ? files.join("~") : files[0] || "";

      // Send the list of filenames in the folder
      console.log('Filenames:', fileres);
      return res.status(200).json({ filenames: fileres, path: folder_path });
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getUpdateImageName = async (req, res) => {
  try {
    const { xml_name } = req.query;
    console.log('getUpdateImageName :', xml_name);
    const folderName = xml_name;

    const input_folder = path.join(`\\\\192.168.90.32\\Images\\${folderName}\\LowRes`);
    const folder_path = `Images//${folderName}//LowRes/`;

    // Check if the directory exists
    if (!fs.existsSync(input_folder)) {
      return res.status(200).json({ message: 'Folder does not exist', filenames: '', path: folder_path });
    }

    // Read the files in the folder
    fs.readdir(input_folder, (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return res.status(500).json({ error: 'Error reading folder' });
      }

      if (files.length === 0) {
        return res.status(200).json({ message: 'Images not exist', filenames: '', path: folder_path });
      }

      // Combine filenames using ~ if there's more than one file
      let fileres = files.length > 1 ? files.join("~") : files[0] || "";

      // Send the list of filenames in the folder
      console.log('Filenames:', fileres);
      return res.status(200).json({ filenames: fileres, path: folder_path });
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.deleteImageName = async (req, res) => {
  try {
    const { xml_name, imagename } = req.query;
    console.log('deleteImageName - xml_name:', xml_name);
    console.log('deleteImageName - imagename:', imagename);

    if (!xml_name || !imagename) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const folderName = xml_name;
    const input_folder = path.join(`\\\\192.168.90.32\\Images\\${folderName}\\LowRes`);
    const folder_path = `Images//${folderName}//LowRes/`;

    // Check if the directory exists
    if (!fs.existsSync(input_folder)) {
      return res.status(200).json({ message: 'Folder does not exist', filenames: '', path: folder_path });
    }

    const imagePath = path.join(input_folder, imagename);

    // Check if the image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(200).json({ message: 'Image does not exist', path: folder_path });
    }

    // Delete the image
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting image:', err);
        return res.status(500).json({ error: 'Error deleting image' });
      }

      // Respond with success message
      console.log('Image deleted:', imagename);
      return res.status(200).json({ message: 'Image deleted successfully', path: folder_path });
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




exports.fetchnews = async (req, res) => {
  let { selectedDate, product, zone, layout, pagename } = req.body;

  try {
    let zonecode;

    if (zone === 'ALL') {
      zonecode = 'ALL';
    } else {
      zonecode = await Zone_Code(zone);
    }

    const productid = await product_Id(product);

    // Check if productid and zonecode are valid
    if (!productid || (zone !== 'ALL' && !zonecode)) {
      return res.status(404).json({ error: 'Invalid product or zone' });
    }

    // Adjust query for 'ALL' zone code
    const query = zonecode === 'ALL'
      ? `SELECT * FROM news_details_new WHERE IssueDate = ? AND Product = ? AND desk_type =? AND Zone_Code=?`
      : `SELECT * FROM news_details_new WHERE IssueDate = ? AND Product = ? AND Zone_Code LIKE ? AND desk_type = ?`;

    const queryParams = zonecode === 'ALL'
      ? [selectedDate, product, layout, zonecode]
      : [selectedDate, product, `%${zonecode}%`, layout];

    const [rows] = await pool.query(query, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    // List of fields that need to be decoded
    const fieldsToDecode = ['Total_Xml', 'HeadKicker', 'Head', 'HeadDeck', 'byline', 'dateline', 'content', 'caption'];

    // Decode specified Base64 encoded fields in each row
    const decodedRows = rows.map(row => {
      const decodedRow = { ...row }; // Copy original row
      fieldsToDecode.forEach(field => {
        if (row[field] && isBase64(row[field])) {
          decodedRow[field] = decodeFromBase64(row[field]);
        }
      });
      return decodedRow;
    });

    res.json(decodedRows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.fetchrevokepage = async (req, res) => {
  const { issueDate, zoneId, productId } = req.body;
  try {

    if (!issueDate || !productId || !zoneId) {
      return res.status(400).json({ error: 'Date, Product ID, and Zone ID are required' });
    }

    const query = `SELECT * FROM page_compose where Issue_Dt = ? and Zone_id = ? and  Product_id = ?`;
    const [rows] = await pool.query(query, [issueDate, zoneId, productId]);
    res.json(rows);
    console.log(rows);

  } catch (error) {
    console.log(error);
  }
}



exports.userdetail = async (req, res) => {
  const { User_Id } = req.body;
  // console.log(User_Id);
  try {
    if (!User_Id) {
      return res.status(400).json({ error: 'User_Id is not found' });
    }

    const query = `SELECT * FROM mas_user WHERE User_id = ?`;
    const [rows, fields] = await pool.query(query, [User_Id]); // Use await here to wait for the query to complete

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]); // Assuming you expect only one row, returning the first row
  } catch (error) {
    console.error('Error in userdetail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.adAuth = async (req, res) => {
  try {
    // Access the request body
    const formData = req.body;
    const formDataJSON = JSON.stringify(formData);
    console.log(formData);

    if (formData !== null) {
      const redirectURL = `http://192.168.90.139:3000/user?formData=${encodeURIComponent(formDataJSON)}`;
      return res.redirect(redirectURL);
    }

    console.log(formDataJSON);

    res.json({ message: 'Form data received successfully', formData: formDataJSON });
  } catch (error) {
    console.error('Error handling POST request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}






//-------------Thumbnail api's ----------------------



exports.articlestatus = async (req, res) => {
  const issueDate = req.query.date;
  const xmlName = req.query.xmlName;
  console.log(issueDate , xmlName);
 
  try {
    if (!xmlName) {
      return res.status(400).json({ error: 'xmlName is not found' });
    }
 
    const query = `SELECT article_status , Processed_user FROM news_details_new n WHERE IssueDate =? AND xml_name=?`;
    const [rows] = await pool.query(query, [issueDate, xmlName]); // Use await here to wait for the query to complete
 
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
 
    res.json(rows[0]); // Assuming you expect only one row, returning the first row
  } catch (error) {
    console.error('Error in userdetail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




exports.productids = async (req, res) => {
  const issueDate = req.query.date;

  if (!issueDate) {
    return res.status(400).json({ error: "Date is required" });
  }

  const query = `
    SELECT DISTINCT PRODUCT_ID
    FROM plan_hdr
    WHERE ISSUE_DT = ?
  `;

  try {
    const [results] = await pool.query(query, [issueDate]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.zoneIdsByProduct = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;

  // console.log("Received request with date:", issueDate, "and productId:", productId);

  if (!issueDate || !productId) {
    return res.status(400).json({ error: "Date and Product ID are required" });
  }

  const query = `
    SELECT DISTINCT ZONE_ID
    FROM plan_hdr
    WHERE ISSUE_DT = ? AND PRODUCT_ID = ?
  `;

  try {
    const [results] = await pool.query(query, [issueDate, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};



exports.editionId = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;

  // console.log("Received request with date:", issueDate, "and productId:", productId);

  if (!issueDate || !productId) {
    return res.status(400).json({ error: "Date and Product ID are required" });
  }

  const query = `
    SELECT DISTINCT EDITION_ID
    FROM plan_hdr
    WHERE ISSUE_DT = ? AND PRODUCT_ID = ?
  `;

  try {
    const [results] = await pool.query(query, [issueDate, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.pagesZones = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;
  const zoneId = req.query.zoneId;
  const active = req.query.Active;

  console.log("Received request with date:", issueDate, "productId:", productId, "zoneId:", zoneId, "Active:", active);

  if (!issueDate || !productId || !zoneId) {
    return res
      .status(400)
      .json({ error: "Date, Product ID, and Zone ID are required" });
  }

  const query = `
    SELECT DISTINCT p.Page_id, p.Page_Num, h.Zone_id, p.Active
    FROM plan_hdr AS h
    INNER JOIN plan_page AS p ON h.Plan_id = p.Plan_id
    WHERE h.ISSUE_DT = ?
      AND h.Zone_id = ?
      AND h.Product_id = ?
    ORDER BY p.Page_Num +0
  `;

  try {
    const [results] = await pool.query(query, [issueDate, zoneId, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.pagesWithoutZones = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;

  // console.log("Received request with date:", issueDate, "and productId:", productId);

  if (!issueDate || !productId) {
    return res
      .status(400)
      .json({ error: "Date and Product ID are required" });
  }

  const query = `
    SELECT DISTINCT Page_Name
    FROM page_compose p
    WHERE Issue_DT = ?
      AND Product_Id = ?
  `;

  try {
    const [results] = await pool.query(query, [issueDate, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getImages = async (req, res) => {
  const { date, zone, product, page, edition } = req.query;

  // console.log("Received request with date:", date, ", zone:", zone, ", product:", product, ", page:", page, ", and edition:", edition);

  // Check if all required parameters are present
  if (!date || !zone || !product || !page || !edition) {
    return res.status(400).json({ error: "Date, Zone, Product, Page, and Edition are required" });
  }

  // Construct the file path
  const filePath = path.join("\\\\192.168.90.32\\EditorialImage\\Image_Preview", date, zone, `${product}_${date}_${zone}_${edition}_${page}.jpg`);

  try {
    // Check if the file exists
    await fs.promises.access(filePath, fs.constants.F_OK);
    // Get file statistics
    const stats = await fs.promises.stat(filePath);
    const modifiedDate = stats.mtime; // Modified date of the file

    // Convert modifiedDate to local time zone string
    const localDateString = modifiedDate.toLocaleString();

    // Send the file with appropriate headers, including the modified date
    res.sendFile(filePath, {
      headers: {
        "Content-Type": "image/jpeg",
        "Last-Modified": localDateString // Add the modified date to the headers
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File not found
      res.status(404).json({ error: "Image not found" });
    } else {
      // Other errors
      res.status(500).json({ error: "Failed to access the file" });
    }
  }
};

// exports.getPdf = async (req, res) => {
//   const { date, zone, product, page, edition } = req.query;

//   console.log("Received request with date:", date, ", zone:", zone, ", product:", product, ", page:", page, ", and edition:", edition);

//   if (!date || !zone || !product || !page || !edition) {
//     return res.status(400).json({ error: "Date, Zone, Product, Page, and Edition are required" });
//   }

//   const filePath = path.join("\\\\192.168.90.32\\EditorialImage\\Image_Preview", date, zone, `${product}_${date}_${zone}_${edition}_${page}.pdf`);

//   console.log(filePath);

//   try {
//     await fs.promises.access(filePath, fs.constants.F_OK);
//     res.sendFile(filePath, { headers: { "Content-Type": "application/pdf" } });
//   } catch (error) {
//     if (error.code === 'ENOENT') {
//       res.status(404).json({ error: "PDF not found" });
//     } else {
//       res.status(500).json({ error: "Failed to access the file" });
//     }
//   }
// };


exports.getPdf = async (req, res) => {
  const { date, zone, product, page, edition } = req.query;

  // console.log("Received request with date:", date, ", zone:", zone, ", product:", product, ", page:", page, ", and edition:", edition);

  if (!date || !zone || !product || !page || !edition) {
    return res.status(400).json({ error: "Date, Zone, Product, Page, and Edition are required" });
  }

  const filePath = path.join("\\\\192.168.90.32\\EditorialImage\\Image_Preview", date, zone, `${product}_${date}_${zone}_${edition}_${page}.pdf`);

  console.log(filePath);

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    const filename = `${product}_${date}_${zone}_${edition}_${page}.pdf`;
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: "PDF not found" });
    } else {
      res.status(500).json({ error: "Failed to access the file" });
    }
  }
};


exports.getPlanData = async (req, res) => {
  const issueDate = req.query.date;
  const zoneId = req.query.zoneId;
  const productId = req.query.productId;

  //console.log("Received request with date:", issueDate, ", zoneId:", zoneId, ", and productId:", productId);

  if (!issueDate || !zoneId || !productId) {
    return res.status(400).json({ error: "Date, Zone ID, and Product ID are required" });
  }

  // const query = `
  //   SELECT Page_Name, Page_No
  //   FROM page_compose
  //   WHERE Issue_Dt = ? AND Zone_id = ? AND Product_id = ? ORDER BY Page_No + 0;
  // `;

  const query = `
    SELECT Page_Name, Page_No, Status, use_user
    FROM page_compose
    WHERE Issue_Dt = ? AND Zone_id = ? AND Product_id = ? ORDER BY Page_No + 0;
  `;

  try {
    const [results] = await pool.query(query, [issueDate, zoneId, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};

//---------------------------Article user api

exports.articleuserids = async (req, res) => {

  const query = `
    SELECT User_ID, User_name FROM mas_user m Where Status='A';
  `;

  try {
    const [results] = await pool.query(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.userfilterdetail = async (req, res) => {
  var { zonecode } = req.query;
  // console.log(`Received zonecode: ${zonecode}`);

  try {
    if (!zonecode) {
      return res.status(400).json({ error: 'zonecode is required' });
    }
    else if (zonecode == 'ALL') {
      zonecode = 'CH'
    }
    // const query = `SELECT * FROM mas_user WHERE depat_name = 'News Desk' AND zone_code = ?`;

    //const query = `SELECT * FROM mas_user WHERE Zone_code = ? AND Depat_name IN ('News Desk', 'Reporting', 'Photography') AND Status = 'A'`;

    const query = `SELECT * FROM mas_user WHERE Zone_code LIKE CONCAT('%', ?, '%') AND Depat_name IN ('News Desk', 'Reporting', 'Photography') AND Status = 'A'`;

    const [rows] = await pool.query(query, [zonecode]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No users found for the provided zone code' });
    }

    res.json(rows); // Return all rows that match the query
  } catch (error) {
    console.error('Error in userfilterdetail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.articleuserzoneids = async (req, res) => {
  const UserID = req.body.UserId;

  // console.log("userId::", UserID);

  if (!UserID) {
    return res.status(400).json({ error: "UserID is required" });
  }

  const query = `
    SELECT User_ID, User_name, Zone_Code
    FROM mas_user m
    WHERE Status='A' AND User_Id = ?;
  `;

  try {
    const [results] = await pool.query(query, [UserID]);
    if (results.length === 0) {
      return res.status(404).json({ error: "No user found with the given UserID" });
    }
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



//-------------Revoke Api ---------------


// Get Plan ID
async function getPlanId(issueDate, productId, zoneId) {
  try {

    const query = 'SELECT a.plan_id FROM plan_hdr a WHERE a.issue_dt = ? AND a.Product_ID = ? AND a.ZONE_ID = ?';
    const [rows] = await pool.query(query, [issueDate, productId, zoneId]);

    console.log("Query result:", rows);

    if (rows.length > 0) {
      // console.log("Plan ID:", rows[0].plan_id);
      return rows[0].plan_id; // Return the plan_id from the first row
    } else {
      console.log("No plan ID found for the given parameters");
      return null; // Return null if no plan_id is found
    }
  } catch (error) {
    console.error('Error fetching Plan Id:', error);
    throw new Error('Failed to retrieve Plan_Id');
  }
}

exports.fetchrevokepage = async (req, res) => {
  const { issueDate, zoneId, productId } = req.body;
  try {

    if (!issueDate || !productId || !zoneId) {
      return res.status(400).json({ error: 'Date, Product ID, and Zone ID are required' });
    }

    const query = `SELECT * FROM page_compose where Issue_Dt = ? and Zone_id = ? and  Product_id = ?`;
    const [rows] = await pool.query(query, [issueDate, zoneId, productId]);
    res.json(rows);

  } catch (error) {
    console.log(error);
  }
}


exports.updatePageCompose = async (req, res) => {
  const { issueDate, zoneId, productId, pageName, newStatus, newNoOfRevokes } = req.body;
  const planid = await getPlanId(issueDate, productId, zoneId);

  try {
    if (!issueDate || !productId || !zoneId || !pageName || !newStatus || !newNoOfRevokes) {
      return res.status(400).json({ error: 'Date, Product ID, Zone ID, Page Name, Status, and No of Revokes are required' });
    }


    if (!planid) {
      return res.status(404).json({ error: 'Plan ID not found' });
    }

    const query = `
      UPDATE page_compose
      SET Status = ?,
          No_of_Revokes = No_of_Revokes + ?
      WHERE Issue_Dt = ?
        AND Zone_id = ?
        AND Product_id = ?
        AND Page_Name = ?
    `;
    const [result1] = await pool.query(query, [newStatus, newNoOfRevokes, issueDate, zoneId, productId, pageName]);
    console.log(`Updated ${result1.affectedRows} row(s) in page_compose`);

    const query1 = 'UPDATE plan_page SET STATUS = ?  WHERE Plan_ID = ? AND Page_id = ?'
    const [result2] = await pool.query(query1, ['Editorial Release', planid, pageName]);
    console.log(`Updated ${result2.affectedRows} row(s) in plan_page`);

    res.status(200).json({
      message: `Updated ${result1.affectedRows} row(s) in page_compose and ${result2.affectedRows} row(s) in plan_page`
    });
  } catch (error) {
    console.error('Error updating page_compose or plan_page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updateActiveStatus = async (req, res) => {
  const { issueDate, productId, zoneId, activeUpdates } = req.body;
  console.log(issueDate, productId, zoneId, activeUpdates);

  try {
    // Validate input
    if (!issueDate || !productId || !zoneId || !Array.isArray(activeUpdates)) {
      return res.status(400).json({ error: 'Issue Date, Product ID, Zone ID, and Active Updates are required' });
    }

    // Fetch plan ID based on issueDate, productId, and zoneId
    const planId = await getPlanId(issueDate, productId, zoneId);

    if (!planId) {
      return res.status(404).json({ error: 'Plan ID not found' });
    }

    // Update active status for each page based on activeUpdates
    const updatePromises = activeUpdates.map(async ({ pageId, isActive }) => {
      // Validate isActive value
      if (isActive !== 1 && isActive !== 2) {
        throw new Error(`Invalid active status value for pageId ${pageId}`);
      }

      // Update database query
      const query = 'UPDATE plan_page SET ACTIVE = ? WHERE Plan_ID = ? AND Page_id = ?';
      const result = await pool.query(query, [isActive, planId, pageId]);

      return { pageId, rowsUpdated: result.affectedRows };
    });

    // Execute all update queries
    const results = await Promise.all(updatePromises);

    // Calculate total updated rows
    const totalUpdatedRows = results.reduce((acc, { rowsUpdated }) => acc + rowsUpdated, 0);

    // Send success response
    res.status(200).json({
      rowsUpdated: totalUpdatedRows,
      message: `Updated ${totalUpdatedRows} row(s) in plan_page`,
    });
  } catch (error) {
    console.error('Error updating active status in plan_page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// ...............Active API....................
 

async function getpagePlanIds(issueDate, productId, pageId) {
  try {
    const query = 'SELECT DISTINCT a.plan_id FROM plan_hdr a JOIN plan_page b ON a.plan_id = b.plan_id WHERE Issue_dt = ? AND Product_id = ? AND page_id = ?';
    const [rows] = await pool.query(query, [issueDate, productId, pageId]);
 
    console.log("Query result:", rows);
 
    if (rows.length > 0) {
      return rows.map(row => row.plan_id); // Return an array of plan_id values
    } else {
      console.log("No plan ID found for the given parameters");
      return []; // Return an empty array if no plan_id is found
    }
  } catch (error) {
    console.error('Error fetching Plan Ids:', error);
    throw new Error('Failed to retrieve Plan_Ids');
  }
}
 
exports.updateActiveStatus = async (req, res) => {
  const { issueDate, productId, zoneId, activeUpdates } = req.body;
  console.log(issueDate, productId, zoneId, activeUpdates);
 
  try {
    // Validate input
    if (!issueDate || !productId || !zoneId || !Array.isArray(activeUpdates)) {
      return res.status(400).json({ error: 'Issue Date, Product ID, Zone ID, and Active Updates are required' });
    }
 
    // Fetch plan ID based on issueDate, productId, and zoneId
    const planId = await getPlanId(issueDate, productId, zoneId);
 
    if (!planId) {
      return res.status(404).json({ error: 'Plan ID not found' });
    }
 
    // Update active status for each page based on activeUpdates
    const updatePromises = activeUpdates.map(async ({ pageId, isActive }) => {
      // Validate isActive value
      if (isActive !== 1 && isActive !== 2) {
        throw new Error(`Invalid active status value for pageId ${pageId}`);
      }
 
      // Update database query
      const query = 'UPDATE plan_page SET ACTIVE = ? WHERE Plan_ID = ? AND Page_id = ?';
      const result = await pool.query(query, [isActive, planId, pageId]);
 
      return { pageId, rowsUpdated: result.affectedRows };
    });
 
    // Execute all update queries
    const results = await Promise.all(updatePromises);
 
    // Calculate total updated rows
    const totalUpdatedRows = results.reduce((acc, { rowsUpdated }) => acc + rowsUpdated, 0);
 
    // Send success response
    res.status(200).json({
      rowsUpdated: totalUpdatedRows,
      message: `Updated ${totalUpdatedRows} row(s) in plan_page`,
    });
  } catch (error) {
    console.error('Error updating active status in plan_page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 
 
 
 
exports.updateActivePageStatus = async (req, res) => {
  const { issueDate, productId, pageId, activeUpdate } = req.body;
 
  console.log("Received request data:", { issueDate, productId, pageId, activeUpdate });
 
  try {
      if (!issueDate || !productId || !pageId || !Array.isArray(activeUpdate)) {
          console.error('Validation failed: Issue Date, Product ID, Page ID, and Active Updates are required');
          return res.status(400).json({ error: 'Issue Date, Product ID, Page ID, and Active Updates are required' });
      }
 
      const planIds = await getpagePlanIds(issueDate, productId, pageId);
 
      if (planIds.length === 0) {
          console.error('No Plan IDs found for given parameters');
          return res.status(404).json({ error: 'No Plan IDs found' });
      }
 
      console.log('Plan IDs:', planIds);
 
      const updatePromises = planIds.map(async (planId, index) => {
          const { pageId, isActive } = activeUpdate[index];
 
          if (isActive !== 1 && isActive !== 2) {
              throw new Error(`Invalid active status value for pageId ${pageId}`);
          }
 
          const query = 'UPDATE plan_page SET ACTIVE = ? WHERE plan_id = ? AND page_id = ?';
          console.log(`Executing query: ${query} with values: [${isActive}, ${planId}, ${pageId}]`);
          const [result] = await pool.query(query, [isActive, planId, pageId]);
 
          console.log(`Updated Plan_ID ${planId} and Page_ID ${pageId} with ACTIVE ${isActive}`);
          return result.affectedRows;
      });
 
      const results = await Promise.all(updatePromises);
 
      const totalUpdatedRows = results.reduce((acc, rowsUpdated) => acc + rowsUpdated, 0);
 
      res.status(200).json({
          rowsUpdated: totalUpdatedRows,
          message: `Updated ${totalUpdatedRows} row(s) in plan_page`,
      });
  } catch (error) {
      console.error('Error updating active status in plan_page:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}; 
 
 
exports.fetchPageIds = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;
 
  console.log("Received request with issueDate:", issueDate, "and productId:", productId);
 
  if (!issueDate || !productId) {
    return res.status(400).json({ error: "Date and Product ID are required" });
  }
 
  const query = `
    SELECT DISTINCT b.page_id
    FROM plan_hdr a
    JOIN plan_page b ON a.plan_id = b.plan_id
    WHERE a.Issue_dt = ?
      AND a.Product_id = ?
  `;
 
  try {
    const [results] = await pool.query(query, [issueDate, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
}; 
 
 
exports.fetchPageDetails = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;
  const pageId = req.query.pageId;
 
  console.log("Received request with date:", issueDate, "productId:", productId, "pageId:", pageId);
 
  if (!issueDate || !productId || !pageId) {
    return res
      .status(400)
      .json({ error: "Date, Product ID, and Page ID are required" });
  }
 
  const query = `
    SELECT DISTINCT b.Page_num, a.Zone_id, b.page_id, b.ACTIVE
    FROM plan_hdr AS a
    JOIN plan_page AS b ON a.plan_id = b.plan_id
    WHERE a.ISSUE_DT = ?
      AND a.Product_id = ?
      AND b.Page_id = ?
  `;
 
  try {
    const [results] = await pool.query(query, [issueDate, productId, pageId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};

//------------- APi for Digital -----------

// exports.getNews = async (req, res) => {
//   const { fromDate, toDate } = req.query;
 
//   // Check if both fromDate and toDate are provided
//   if (!fromDate || !toDate) {
//     return res.status(400).json({ error: "fromDate and toDate are required" });
//   }
 
//   // SQL query using placeholders for parameters
//   const query = `
//     SELECT XML_name, IssueDate, desk_type, Status, Articles_Created, Created_user, (xml_exported_dateTime) AS DateTime, Head
//     FROM news_details_new
//     WHERE IssueDate BETWEEN ? AND ?;
//   `;
 
//   try {
//     const [results] = await pool.query(query, [fromDate, toDate]);
 
//     if (results.length === 0) {
//       return res.status(404).json({ message: "No news found for the specified dates." });
//     }
 
//     console.log('results',results);
   
 
//     // Use Promise.all to handle asynchronous operations inside the map
//     const updatedResults = await Promise.all(
//       results.map(async (result) => {
 
//         // Format IssueDate to "YYYY-MM-DD"
//         const originalIssueDate = new Date(result.IssueDate);
//         const formattedIssueDate = originalIssueDate.toISOString().split('T')[0];
   
//         // Add one day to the original IssueDate
//         const nextDay = new Date(originalIssueDate);
//         nextDay.setDate(originalIssueDate.getDate() + 1);
   
//         // Format the new date to "YYYY-MM-DD"
 
//         const formattedNextDay = nextDay.toISOString().split('T')[0];
//         // Decode the Head field from Base64
//         const decodedHead = decodeFromBase64(result.Head);
 
//         // Fetch the User_name based on Created_user ID (awaiting the async function)
//         const userName = await User_Name(result.Created_user);
 
//         return {
//           ...result,
//           IssueDate: formattedNextDay,
//           Head: decodedHead,            
//           Created_user: userName || result.Created_user,
//         };
//       })
//     );
 
//     // Return the updated results with formatted IssueDate and decoded Head
//     return res.json({
//       count: updatedResults.length,
//       data: updatedResults
//     });
//   } catch (error) {
//     console.error("Database query failed:", error);
//     return res.status(500).json({ error: "Database query failed" });
//   }
// };

exports.getNews = async (req, res) => {
  const { fromDate, toDate } = req.query;

  // Check if both fromDate and toDate are provided
  if (!fromDate || !toDate) {
    return res.status(400).json({ error: "fromDate and toDate are required" });
  }

  // SQL query using placeholders for parameters
  const query = `
    SELECT XML_name, IssueDate, desk_type, Status, Articles_Created, Created_user, (xml_exported_dateTime) AS DateTime, Head
    FROM news_details_new
    WHERE IssueDate BETWEEN ? AND ?;
  `;

  try {
    const [results] = await pool.query(query, [fromDate, toDate]);

    if (results.length === 0) {
      // Change to 200 and return a message that no data was found
      return res.status(200).json({ message: "No Article Created for this Date" });
    }

    // Define a mapping between Status codes and their corresponding stages
    const statusMap = {
      "T": "Submit",
      "P": "Approved",
      "S": "Assigned",
      "D": "PR Done",
      "A": "Finalize",
      "F": "Saved"
    };

    // Use Promise.all to handle asynchronous operations inside the map
    const updatedResults = await Promise.all(
      results.map(async (result) => {

        // Format IssueDate to "YYYY-MM-DD"
        const originalIssueDate = new Date(result.IssueDate);
        const formattedIssueDate = originalIssueDate.toISOString().split('T')[0];

        // Add one day to the original IssueDate
        const nextDay = new Date(originalIssueDate);
        nextDay.setDate(originalIssueDate.getDate() + 1);

        // Format the new date to "YYYY-MM-DD"
        const formattedNextDay = nextDay.toISOString().split('T')[0];

        // Decode the Head field from Base64
        const decodedHead = decodeFromBase64(result.Head);

        // Fetch the User_name based on Created_user ID (awaiting the async function)
        const userName = await User_Name(result.Created_user);

        // Map the Status code to its corresponding stage
        const stage = statusMap[result.Status] || result.Status; // Default to the original status if not found

        return {
          ...result,
          IssueDate: formattedNextDay,
          Head: decodedHead,
          Created_user: userName || result.Created_user,
          Status: stage  // Replace the Status with the mapped stage
        };
      })
    );

    // Return the updated results with formatted IssueDate and decoded Head
    return res.json({
      count: updatedResults.length,
      data: updatedResults
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Database query failed" });
  }
};

 
 
 
 
// exports.getNewsContant = async (req, res) => {
//   const { XML_name, IssueDate } = req.query;
 
//   // Check if both XML_name and IssueDate are provided
//   if (!XML_name || !IssueDate) {
//     return res.status(400).json({ error: 'XML_name and IssueDate are required' });
//   }
 
//   // SQL query
//   const query = `
//     SELECT XML_name, IssueDate, desk_type, Status, Articles_Created, Created_user, (xml_exported_dateTime) AS DateTime, content,
//     CONCAT(HeadKicker, ' ', Head, ' ', HeadDeck) AS Headline, Image_Name, Image_Path
//     FROM news_details_new
//     WHERE XML_name = ? AND IssueDate = ?;
//   `;
 
//   try {
//     const [results] = await pool.query(query, [XML_name, IssueDate]);
 
//     // console.log('results',results);
   
 
//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No story found for the specified XML_name and IssueDate.' });
//     }
 
//     const baseUrl = "https://reporters.hindutamil.in/ImageSrc/";
 
//     // Use Promise.all to handle async operations inside the map
//     const updatedResults = await Promise.all(
//       results.map(async (result) => {
//         const imageNames = result.Image_Name ? result.Image_Name.split('~') : [];
 
//         // Create an array of full image URLs
//         const fullImageUrls = imageNames.map(imageName => baseUrl + result.Image_Path + imageName);
 
//         // Decode the content and headline from Base64
//         const decodedContent = decodeFromBase64(result.content);
//         const decodedHeadline = decodeFromBase64(result.Headline);
 
//         const originalIssueDate = new Date(result.IssueDate);
//     const formattedIssueDate = originalIssueDate.toISOString().split('T')[0];
 
//     // Add one day to the original IssueDate
//     const nextDay = new Date(originalIssueDate);
//     nextDay.setDate(originalIssueDate.getDate() + 1); // Add one day
 
//     // Format the new date to "YYYY-MM-DD"
//     const formattedNextDay = nextDay.toISOString().split('T')[0];
 
//         // Fetch the User_name based on Created_user ID (await the async function)
//         const userName = await User_Name(result.Created_user);
 
//         return {
//           ...result,
//           IssueDate: formattedNextDay,  
//           content: decodedContent,  
//           Headline: decodedHeadline,
//           Created_user: userName || result.Created_user,
//           fullImageUrls,  
//         };
//       })
//     );
 
//     // console.log('update ',updatedResults);
   
//     return res.json(updatedResults);
//   } catch (error) {
//     console.error('Database query failed:', error);
//     return res.status(500).json({ error: 'Database query failed' });
//   }
// };

exports.getNewsContant = async (req, res) => {
  const { XML_name, IssueDate } = req.query;

  // Check if both XML_name and IssueDate are provided
  if (!XML_name || !IssueDate) {
    return res.status(400).json({ error: 'XML_name and IssueDate are required' });
  }

  // SQL query
  const query = `
    SELECT XML_name, IssueDate, desk_type, Status, Articles_Created, Created_user, (xml_exported_dateTime) AS DateTime, content,
    CONCAT(HeadKicker, ' ', Head, ' ', HeadDeck) AS Headline, Image_Name, Image_Path
    FROM news_details_new
    WHERE XML_name = ? AND IssueDate = ?;
  `;

  try {
    const [results] = await pool.query(query, [XML_name, IssueDate]);

    // If no results found, return 404
    if (results.length === 0) {
      return res.status(404).json({ message: 'No story found for the specified XML_name and IssueDate.' });
    }

    const baseUrl = "https://reporters.hindutamil.in/ImageSrc/";

    // Define a mapping between Status codes and their corresponding stages
    const statusMap = {
      "T": "Submit",
      "P": "Approved",
      "S": "Assigned",
      "D": "PR Done",
      "A": "Finalize",
      "F": "Saved",
      "R":"Rejected"
    };

    // Use Promise.all to handle async operations inside the map
    const updatedResults = await Promise.all(
      results.map(async (result) => {
        const imageNames = result.Image_Name ? result.Image_Name.split('~') : [];

        // Create an array of full image URLs
        const fullImageUrls = imageNames.map(imageName => baseUrl + result.Image_Path + imageName);

        // Decode the content and headline from Base64
        const decodedContent = decodeFromBase64(result.content);
        const decodedHeadline = decodeFromBase64(result.Headline);

        const originalIssueDate = new Date(result.IssueDate);
        const formattedIssueDate = originalIssueDate.toISOString().split('T')[0];

        // Add one day to the original IssueDate
        const nextDay = new Date(originalIssueDate);
        nextDay.setDate(originalIssueDate.getDate() + 1); // Add one day

        // Format the new date to "YYYY-MM-DD"
        const formattedNextDay = nextDay.toISOString().split('T')[0];

        // Fetch the User_name based on Created_user ID (await the async function)
        const userName = await User_Name(result.Created_user);

        // Map the Status code to its corresponding stage
        const stage = statusMap[result.Status] || result.Status; // Default to the original status if not found

        return {
          ...result,
          IssueDate: formattedNextDay,
          Status: stage,  // Use the mapped stage
          content: decodedContent,
          Headline: decodedHeadline,
          Created_user: userName || result.Created_user,
          fullImageUrls,
        };
      })
    );

    return res.json(updatedResults);
  } catch (error) {
    console.error('Database query failed:', error);
    return res.status(500).json({ error: 'Database query failed' });
  }
};

exports.updateUserName = async (req, res) => {
  let { emp_id, new_name } = req.body;

  try {
    // Validate input
    if (!emp_id || !new_name) {
      return res.status(400).json({ error: "User ID and new name are required" });
    }

    // Construct the query to update the user name
    const query = `
      UPDATE mas_user 
      SET User_name = ? 
      WHERE User_Id = ?
    `;

    const queryParams = [new_name, emp_id];

    const [results] = await pool.query(query, queryParams);

    // Check if the update was successful
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send success response
    res.json({ message: "User name updated successfully" });
  } catch (error) {
    console.error("Error updating user name:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
