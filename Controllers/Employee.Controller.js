const xlsx = require('node-xlsx').default;
const createError = require("http-errors");
//const Employee = require("../Models/Employee.model");
//const Id = require("../Models/Id");
const mongoose = require("mongoose");
var faker = require("faker");
const AdmZip = require('adm-zip');
var QRCode = require('qrcode');
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
var xl = require('excel4node');
//var vCard = require('vcard-parser');
const EmployeeService = require("../Services/Employee.Service");
const employeesInPage = 10;
const fs = require('fs')
const { getNamespace } = require("continuation-local-storage");
const modelNameId = "Id"
const schemaId = require("../Models/Id")
const escapeRegExp = (string) => {
  if (string) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

  }
}
const convertSearchStringIntoQuery = (string) => {
  let query = []
  if (string) {
    string.split(' ').filter(token => token !== '').filter(token => !isNaN(parseInt(token))).map(token => {
      query.push({ 'id': parseInt(token) })
      query.push({ 'civilId': parseInt(token) })
    })
    string.split(' ').filter(token => token !== '').map(token => {
      query.push({ 'name.first': { '$regex': token, $options: 'i' } })
      query.push({ 'name.last': { '$regex': token, $options: 'i' } })
      query.push({ 'name.prefix': { '$regex': token, $options: 'i' } })
      query.push({ 'name.middle': { '$regex': token, $options: 'i' } })
      query.push({ 'name.suffix': { '$regex': token, $options: 'i' } })
      query.push({ 'address.street': { '$regex': token, $options: 'i' } })
      query.push({ 'address.POBox': { '$regex': token, $options: 'i' } })
      query.push({ 'address.city': { '$regex': token, $options: 'i' } })
      query.push({ 'address.neighborhood': { '$regex': token, $options: 'i' } })
      query.push({ 'address.state': { '$regex': token, $options: 'i' } })
      query.push({ 'address.zipCode': { '$regex': token, $options: 'i' } })
      query.push({ 'address.country': { '$regex': token, $options: 'i' } })
      query.push({ 'IMAccount.info': { '$regex': escapeRegExp(token), $options: 'i' } })
      query.push({ 'website.info': { '$regex': token, $options: 'i' } })
      query.push({ 'event.info': { '$regex': token, $options: 'i' } })
      query.push({ 'relationship.info': { '$regex': token, $options: 'i' } })
      query.push({ 'SIP.info': { '$regex': token, $options: 'i' } })
      query.push({ 'phone.info': { '$regex': escapeRegExp(token), $options: 'i' } })
      query.push({ 'email.info': { '$regex': token, $options: 'i' } })
      query.push({ 'status': { '$regex': '^' + token, $options: 'mi' } })
      query.push({ 'organization.jobTitle': { '$regex': token, $options: 'i' } })
      query.push({ 'notes': { '$regex': token, $options: 'i' } })
      query.push({ 'organization.department': { '$regex': token, $options: 'i' } })
      query.push({ 'organization.company': { '$regex': token, $options: 'i' } })
    })
  }
  return query;
}
let importProgressPercentage = 0;
let exportProgressPercentage = 0;
const namespace = getNamespace("unique context")
const modelName = "Employee"
const schema = require("../Models/Employee.model")
const getConnection = () => {
    return namespace.get("connection")
}
const getEmployeeModel = (connection) => {
  return connection.model(modelName, schema)
}
module.exports = {
  createEmployee: async (req, res, next) => {
    try {
      const tenantId = req.headers['tenant']
      const connection = getConnection();
      let result = await EmployeeService.createEmployee(req.body, connection, tenantId)
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(createError(422, error.message));
      next(error);
    }
  },
  
  UploadImage: async (req, res, next) => {
    try {
      if (!req.file) throw createError(400, "Bad Image");
      res.send(new SuccessResponse(true, req.file.filename))
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(createError(422, error.message));
      next(error);
    }
  },
  updateEmployee: async (req, res, next) => {
    try {
      if (!req.body) throw createError(400, "employee can not be empty.");
      const id = req.params.id;
      
      const connection = getConnection();
      const result = await EmployeeService.updateEmployee(id, req.body, connection)
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid Product Id"));
      next(error);
    }
  },
  deleteEmployee: async (req, res, next) => {
    try {
      const id = req.params.id;
      
      const connection = getConnection();
      await EmployeeService.deleteEmployee(id, connection)
      res.send(new SuccessResponse(true, {}));
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid employee id"));
      next(error);
    }
  },
  deleteEmployees: async (req, res) => {
    try {
      if (!req.body) throw createError(400, "list can not be empty.");
      if (req.body[0] === "all") {
        
        const Employee = getEmployeeModel(getConnection());
        await Employee.remove({})
      }
      else
        for (const id of req.body) {
          EmployeeService.deleteEmployee(id, Employee)
        }
      res.send(new SuccessResponse(true, {}));
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid employee id"));
      next(error);
    }
  },
  search: async (req, res, next) => {
    try {
      let searchString = req.body.search;
      let requestedPage = req.query.page
      if (requestedPage == null || requestedPage <= 0) requestedPage = 1;
      let requestedEmployeesInPage = req.query.take
      if (requestedEmployeesInPage == null || requestedEmployeesInPage <= 0) requestedEmployeesInPage = employeesInPage;
      requestedEmployeesInPage = parseInt(requestedEmployeesInPage)
      let chunk = {
        skip: requestedEmployeesInPage * (requestedPage - 1),
        limit: requestedEmployeesInPage
      }
      const query = convertSearchStringIntoQuery(searchString)
      let searchQuery = searchString ?
        { $or: query } : {};

      
      const Employee = getEmployeeModel(getConnection());
      const employeesWithoutChunk = await Employee.find(searchQuery, {});
      const employees = await Employee.find(searchQuery, {}, chunk);
      let countSearch = await employeesWithoutChunk.length;
      countSearch = parseInt(countSearch);
      let pageCount = Math.ceil(countSearch / requestedEmployeesInPage);
      let count = await Employee.countDocuments();
      count = parseInt(count);
      // const results = await Product.find({}, { name: 1, price: 1, _id: 0 });
      // const results = await Product.find({ price: 699 }, {});
      res.send(new SuccessResponse(true, { employees: employees, pageCount, count }));
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  getEmployees: async (req, res, next) => {
    try {
      let requestedPage = req.query.page
      if (requestedPage == null || requestedPage <= 0) requestedPage = 1;
      let requestedEmployeesInPage = req.query.take
      if (requestedEmployeesInPage == null || requestedEmployeesInPage <= 0) requestedEmployeesInPage = employeesInPage;
      requestedEmployeesInPage = parseInt(requestedEmployeesInPage)
      let chunk = {
        skip: requestedEmployeesInPage * (requestedPage - 1),
        limit: requestedEmployeesInPage
      }
      
      const Employee = getEmployeeModel(getConnection());
      let count = await Employee.countDocuments();
      count = parseInt(count);
      let pageCount = Math.ceil(count / requestedEmployeesInPage);
      const employees = await Employee.find({}, {}, chunk);
      // const results = await Product.find({}, { name: 1, price: 1, _id: 0 });
      // const results = await Product.find({ price: 699 }, {});
      res.send(new SuccessResponse(true,
        { employees: employees, pageCount, count }));
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  findEmployeeById: async (req, res, next) => {
    try {
      const id = req.params.id;
      
      const Employee = getEmployeeModel(getConnection());
      const employee = await Employee.findById(id);
      // const product = await Product.findOne({ _id: id });
      if (!employee)
        throw createError.NotFound({
          array_error: [
            new ErrorResponse(
              "findEmployeeById",
              "id",
              `Employee ${id} isn't Exist`
            ),
          ],
          code: "EMPLOYEE_NOT_FOUND",
        });
      res.send(
        new SuccessResponse(true, employee));
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid employee id"));
      next(error);
    }
  },
  findEmployeeByIdToGuest: async (req, res, next) => {
    try {
      const id = req.params.id;
      const connection = getConnection()
      const Employee = getEmployeeModel(connection);
      const employee = await Employee.findById(id);
      // const product = await Product.findOne({ _id: id });
      if (!employee)
        throw createError.NotFound({
          array_error: [
            new ErrorResponse(
              "findEmployeeByIdToGuest",
              "id",
              `Employee ${id} isn't Exist`
            ),
          ],
          code: "EMPLOYEE_NOT_FOUND",
        });

      if (employee.status !== 'Active')
        throw createError.Forbidden({
          array_error: [
            new ErrorResponse(
              "findEmployeeByIdToGuest",
              "id",
              `Employee ${id} is InActive`
            ),
          ],
          code: "EMPLOYEE_INACTIVE",
        });
      const resultEmployee = EmployeeService.filterEmployeeByDisplays(employee, connection)
      res.send(new SuccessResponse(true, resultEmployee));
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  downloadVCard: async (req, res) => {
    const id = req.params.id;
    
    const Employee = getEmployeeModel(getConnection());
    const employee = await Employee.findById(id);
    if (!employee) throw createError(404, "employee does not exist.");
    const myVCard = await EmployeeService.getVCard(employee)
    res.set('Content-Type', 'text/vcard; name="enesser.vcf"');
    res.set('Content-Disposition', 'inline; filename="enesser.vcf"');

    //send the response
    res.send(myVCard);
  },
  downloadVCardGuest: async (req, res) => {
    const id = req.params.id;
    
    const Employee = getEmployeeModel(getConnection());
    const employee = await Employee.findById(id);
    const resultEmployee = EmployeeService.filterEmployeeByDisplays(employee, Employee)
    if (!employee) throw createError(404, "employee does not exist.");
    const myVCard = await EmployeeService.getVCard(resultEmployee)
    res.set('Content-Type', 'text/vcard; name="enesser.vcf"');
    res.set('Content-Disposition', 'inline; filename="enesser.vcf"');
    //send the response
    res.send(myVCard);
  },
  downloadVCards: async (req, res) => {
    if (!req.body) throw createError(400, "list can not be empty.");
    let vCSs = [];
    
    const Employee = getEmployeeModel(getConnection());
    if (req.body[0] === "all") {
      vCSs = await Employee.find({}).lean()
    }
    else
      for (const id of req.body) {
        const employee = await Employee.findById(id);
        if (!employee) throw createError(404, "employee does not exist.");
        vCSs.push(employee);
      }
    let vCards = "";
    for (const employee of vCSs) {
      const myVCard = await EmployeeService.getVCard(employee)
      vCards += '\n' + myVCard;
    }
    //set content-type and disposition including desired filename
    res.set('Content-Type', 'text/vcard; name="enesser.vcf"');
    res.set('Content-Disposition', 'inline; filename="enesser.vcf"');

    //send the response
    res.send(vCards);
  },

  downloadQRs: async (req, res, next) => {
    try {
      if (!req.body) throw createError(400, "list can not be empty.");
      let qrs = [];
      
      const Employee = getEmployeeModel(getConnection());
      if (req.body[0] === "all") {
        qrs = await Employee.find({}).lean()
      }
      else
        for (const id of req.body) {
          const employee = await Employee.findById(id);
          if (!employee) throw createError(404, "employee does not exist.");
          qrs.push(employee);
        }
      var zip = new AdmZip();
      for (const element of qrs) {
        const base64Data = element.qrcode.replace(/^data:image\/png;base64,/, "");
        const binaryData = new Buffer(base64Data, 'base64');
        zip.addFile(element.name.first + "." + element.name.last + ".png", Buffer.alloc(binaryData.length, binaryData));
      }
      //zip.addLocalFile("./images/1622104135645.jpeg");
      zip.writeZip("./files.zip");


      res.send(new SuccessResponse(true, {}));

    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid Product Id"));
      next(error);
    }
  },
  exportExcel: async (req, res, next) => {
    try {
      if (!req.body) throw createError(400, "list can not be empty.");
      exportProgressPercentage = 0
      let employees = [];
      
      const Employee = getEmployeeModel(getConnection());
      if (req.body[0] === "all") {
        employees = await Employee.find({}).lean()
      }
      else
        for (const id of req.body) {
          const employee = await Employee.findById(id);
          if (!employee) throw createError(404, "employee does not exist.");
          employees.push(employee);
        }

      var wb = new xl.Workbook();
      // Add Worksheets to the workbook
      var ws = wb.addWorksheet('Sheet 1');
      // Create a reusable style
      var styleHeader = wb.createStyle(EmployeeService.getExcelHeadingStyle());
      var style = wb.createStyle(EmployeeService.getExcelStyle());
      EmployeeService.getExcelHeading(ws, styleHeader);
      const length = employees.length / 100;
      employees.map((employee, index) => {
        exportProgressPercentage += 1 / length
        EmployeeService.getExcelEmployee(ws, style, employee, index + 2)
      });
      wb.write('Excel.xlsx', function (err, stats) {
        if (err) {
          console.error(err);
        } else {
          res.send(new SuccessResponse(true, {}))
        }
      });

    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid Product Id"));
      next(error);
    }
  },
  importExcel: async (req, res, next) => {
    try {
      importProgressPercentage = 0;
      let results = []
      var wb = new xl.Workbook();
      var ws = wb.addWorksheet('Sheet 1');
      var styleHeader = wb.createStyle(EmployeeService.getExcelHeadingStyle());
      var style = wb.createStyle(EmployeeService.getExcelStyle());
      EmployeeService.getExcelHeading(ws, styleHeader);
      EmployeeService.getExcelErrorsHeading(ws, styleHeader);
      let row = 2;
      var filename = './Excel/' + req.file.filename;
      const workSheetsFromFile = xlsx.parse(filename);
      const data = workSheetsFromFile[0].data;
      data.splice(0, 1)
      const length = data.length / 100;
      
      const Employee = getEmployeeModel(getConnection());
      for (const item of data) {
        importProgressPercentage += 1 / length
        let employee = {}
        try {
          employee = await EmployeeService.convertExcelToEmployee(item, Employee);
          await EmployeeService.createEmployee(employee, Employee);
        } catch (error) {
          EmployeeService.getExcelEmployee(ws, style, employee, row)
          EmployeeService.getExcelError(ws, style, error.message, row++);
          results.push(error);
        }

      }
      wb.write('ErrorsExcel.xlsx');
      res.send(new SuccessResponse(true, { errorsCount: results.length }));
    } catch (error) {
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid Product Id"));
      next(error);
    }
  },
  getImportProgressPercentage: async (req, res, next) => {
    res.send(new SuccessResponse(true, { percentage: importProgressPercentage }))
  },
  getExportProgressPercentage: async (req, res, next) => {
    res.send(new SuccessResponse(true, { percentage: exportProgressPercentage }))
  }

};

/*testAdd5000Employee: async (req, res, next) => {
    try {
      let employees = [];
      const relationship = ["Parent", "Mother", "Father", "Brother", "Sister", "Spouse", "Child", "Friend", "Relative"]
      let count = await Id.countDocuments();
      count += 1000;
      for (let i = 0; i < 5000; i++) {
        let employee = {
          'id': count,
          'civilId': count,
          'name': {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
            prefix: faker.name.prefix(),
            middle: faker.name.middleName(),
            suffix: faker.name.suffix()
          },
          'status': count % 2 === 0 ? 'Active' : 'Inactive',
          'email': [{ info: faker.internet.email(), type: "Home" }],
          'phone': [{ code:"+963", info: faker.datatype.number({min:111111,max:9999999}).toString(), type: "Home" }],
          'organization': {
            jobTitle: faker.name.jobTitle(),
            department: faker.commerce.department(),
            company: faker.company.companyName()
          },
          'address': [{
            street: faker.address.streetAddress(),
            POBox: faker.address.timeZone(),
            neighborhood: faker.address.secondaryAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            zipCode: faker.address.zipCode(),
            country: faker.address.country(),
            type: "Home"
          }],
          'IMAccount': [{ code:"+963", info: faker.datatype.number({min:111111,max:9999999}).toString(), type: "Home" }],
          'website': [{ info: faker.internet.url() }],
          'event': [{ info: faker.date.past().toISOString(), type: "Birthday" }],
          'relationship': [{ info: faker.name.firstName(), type: relationship[count % relationship.length] }],
          'notes': "",
        }
        employees.push(employee)
        count++
      }
      employees.forEach(async (element) => {
        let result = await EmployeeService.createEmployee(element)
        const id = new Id({ content: result.result._id })
        await id.save();
      })
      res.send("Success");
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(createError(422, error.message));
      next(error);
    }
  },
  testDeleteEmployee: async (req, res, next) => {
    try {
      const ids = await Id.find({});
      for (let i = 0; i < ids.length; i++) {
        const result = await Employee.findByIdAndDelete(ids[i].content);
        await Id.findByIdAndDelete(ids[i]._id);
      }
      res.send(new SuccessResponse(true, {}));
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid employee id"));
      next(error);
    }
  },
  editQREmployee: async (req, res, next) => {
    try {
      const id = req.params.id;
      const employee = await Employee.findById(id);
      // const product = await Product.findOne({ _id: id });
      if (!employee)
        throw createError.NotFound({
          array_error: [
            new ErrorResponse(
              "findEmployeeById",
              "id",
              `Employee ${id} isn't Exist`
            ),
          ],
          code: "EMPLOYEE_NOT_FOUND",
        });

      let qrcode = '';

      await QRCode.toDataURL(process.env.BASEURL + '/empid?' + employee._id, async function (err, url) {
        qrcode = url;
        employee.qrcode = qrcode;
        const result = await employee.save();
        res.send(result);
      })
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(createError(422, error.message));
      next(error);
    }
  },
  */

  /*importVCard: async (req, res, next) => {
    try {
      let employeeCounter = 0;
      let results = []
      let raw = "";
      var wb = new xl.Workbook();
      var ws = wb.addWorksheet('Sheet 1');
      var styleHeader = wb.createStyle(EmployeeService.getExcelHeadingStyle());
      var style = wb.createStyle(EmployeeService.getExcelStyle());
      EmployeeService.getExcelErrorsHeading(ws, styleHeader);
      let row = 2;
      var filename = './VCards/' + req.file.filename;
      fs.readFile(filename, 'utf8', async function (err, data) {
        if (err) throw err;
        console.log('OK: ' + filename);
        raw = data;
        raw = raw.split("BEGIN:VCARD")
        raw.splice(0, 1);
        raw = raw.map(item => "BEGIN:VCARD" + item)
        for (const item of raw) {
          let employee = await EmployeeService.convertVCardToEmployee(vCard.parse(item))
          try {
            await EmployeeService.createEmployee(employee)
            employeeCounter++;
          } catch (error) {
            EmployeeService.getExcelError(ws, style, error.message, row++, ++employeeCounter)
            results.push(error)
          }
        }
        wb.write('ErrorsExcel.xlsx');
        res.send(new SuccessResponse(true, { errorsCount: results.length }));
      });
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid Product Id"));
      next(error);
    }
  },
  */