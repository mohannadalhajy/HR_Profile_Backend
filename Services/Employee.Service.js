const { ErrorResponseWithCode, SuccessResponse, ErrorResponse } = require("../Helpers/Response.Helper");
const createError = require("http-errors");
const VCard = require('vcard-creator').default
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
var QRCode = require('qrcode');
const path = require('path');
//const Employee = require("../Models/Employee.model");
const fs = require('fs');
const PublicDisplayService = require("./PublicDisplay.Service");
const CountryCodeService = require("./CountryCode.Service");
const IMAGES_API_URL = process.BASEURL + '/'
const modelName = "Employee"
const schema = require("../Models/Employee.model")
const getEmployeeModel = (connection) => {
  return connection.model(modelName, schema)
}
const modelNameCountryCode = "CountryCode"
const schemaCountryCode = require("../Models/CountryCode.model")
const getCountryCodeModel = (connection) => {
  return connection.model(modelNameCountryCode, schemaCountryCode)
}
const modelNamePublicDisplay = "PublicDisplay"
const schemaPublicDisplay = require("../Models/PublicDisplay.model")
const getPublicDisplayModel = (connection) => {
  return connection.model(modelNamePublicDisplay, schemaPublicDisplay)
}
const convertArrayToString = (array) => {
  try {
    let result = "";
    array.map(element => {
      result += element.info + ";";
    });
    return result === "" ? "" : result.substring(0, result.length - 1)
  } catch (error) {
    return "error" + error;
  }
}
const convertEmailToString = (array) => {
  try {
    let result = "";
    array.map(element => {
      result += element.info + "," + element.type + ";";
    });
    return result === "" ? "" : result.substring(0, result.length - 1)
  } catch (error) {
    return "error" + error;
  }
}
const convertPhoneToString = (array) => {
  try {
    let result = "";
    array.map(element => {
      result += element.code.slice(1) + "," + element.info + "," + element.type + ";";
    });
    return result === "" ? "" : result.substring(0, result.length - 1)
  } catch (error) {
    return "error" + error;
  }
}
const convertAddressToString = (array) => {
  try {
    let result = { street: "", POBox: "", neighborhood: "", city: "", state: "", zipCode: "", country: "" };
    array.map(element => {
      result.street += element.street + ";";
      result.POBox += element.POBox + ";";
      result.neighborhood += element.neighborhood + ";";
      result.city += element.city + ";";
      result.state += element.state + ";";
      result.zipCode += element.zipCode + ";";
      result.country += element.country + ";";
    });
    if (result.street !== "") result = { ...result, street: result.street.substring(0, result.street.length - 1) }
    if (result.POBox !== "") result = { ...result, POBox: result.POBox.substring(0, result.POBox.length - 1) }
    if (result.neighborhood !== "") result = { ...result, neighborhood: result.neighborhood.substring(0, result.neighborhood.length - 1) }
    if (result.city !== "") result = { ...result, city: result.city.substring(0, result.city.length - 1) }
    if (result.state !== "") result = { ...result, state: result.state.substring(0, result.state.length - 1) }
    if (result.zipCode !== "") result = { ...result, zipCode: result.zipCode.substring(0, result.zipCode.length - 1) }
    if (result.country !== "") result = { ...result, country: result.country.substring(0, result.country.length - 1) }
    return { result: result }
  } catch (error) {
    return "error" + error;
  }
}
const checkOfEmployee = async (employee, arrayError, type, Employee) => {
  if (!employee) {
    arrayError.push(new ErrorResponseWithCode(
      "createEmployee",
      "Employee",
      "employee can not be empty.",
      SERVER_ERRORS.EMPLOYEE_EMPTY
    ))
    return;
  }
  if (type === "edit")
    await checkEditIdAndCivilId(arrayError, employee.id, employee.civilId, Employee)
  else
    await checkIdAndCivilId(arrayError, employee.id, employee.civilId, Employee)
  if (!employee.name || !employee.name.first || !employee.name.last) {
    arrayError.push(new ErrorResponseWithCode(
      "createEmployee",
      "name",
      `Employee name is empty`,
      SERVER_ERRORS.EMPLOYEE_NAME_EMPTY
    ))
  }
  employee.phone.map(phone => {
    const result = validationPhone(phone.info, "Phone")
    if (result) arrayError.push(result)
  });
  if (employee.phone && employee.phone.length === 0) {
    arrayError.push(new ErrorResponseWithCode(
      "createEmployee",
      "Phone",
      "There is no mobile number",
      SERVER_ERRORS.EMPLOYEE_PHONE_EMPTY
    ))
  }
  employee.email.map(email => {
    const result = validationEmail(email.info)
    if (result) arrayError.push(result)
  });
  if (employee.email && employee.email.length === 0) {
    arrayError.push(new ErrorResponseWithCode(
      "createEmployee",
      "Email",
      "There is no email address",
      SERVER_ERRORS.EMPLOYEE_EMAIL_EMPTY
    ))
  }
  if (employee.IMAccount) employee.IMAccount.filter(IMAccount => IMAccount.info !== "").map(IMAccount => {
    const result = validationPhone(IMAccount.info, "IM account")
    if (result) arrayError.push(result)
  });
  if (employee.event) employee.event.map(event => {
    const result = validationEvent(event.info)
    if (result) arrayError.push(result)
  })
}

const setDisplay = async (employee, body, PublicDisplay) => {
  if (body.imageDisplay !== undefined)
    employee.imageDisplay = body.imageDisplay
  else
    employee.imageDisplay = await PublicDisplayService.getDisplayByName("image", PublicDisplay)
  if (body.organizationDisplay !== undefined)
    employee.organizationDisplay = body.organizationDisplay
  else
    employee.organizationDisplay = await PublicDisplayService.getDisplayByName("organization", PublicDisplay)

  if (body.phoneDisplay !== undefined)
    employee.phoneDisplay = body.phoneDisplay
  else
    employee.phoneDisplay = await PublicDisplayService.getDisplayByName("phone", PublicDisplay)

  if (body.emailDisplay !== undefined)
    employee.emailDisplay = body.emailDisplay
  else
    employee.emailDisplay = await PublicDisplayService.getDisplayByName("email", PublicDisplay)

  if (body.addressDisplay !== undefined)
    employee.addressDisplay = body.addressDisplay
  else
    employee.addressDisplay = await PublicDisplayService.getDisplayByName("address", PublicDisplay)

  if (body.IMAccountDisplay !== undefined)
    employee.IMAccountDisplay = body.IMAccountDisplay
  else
    employee.IMAccountDisplay = await PublicDisplayService.getDisplayByName("IMAccount", PublicDisplay)

  if (body.websiteDisplay !== undefined)
    employee.websiteDisplay = body.websiteDisplay
  else
    employee.websiteDisplay = await PublicDisplayService.getDisplayByName("website", PublicDisplay)

  if (body.eventDisplay !== undefined)
    employee.eventDisplay = body.eventDisplay
  else
    employee.eventDisplay = await PublicDisplayService.getDisplayByName("event", PublicDisplay)

  if (body.relationshipDisplay !== undefined)
    employee.relationshipDisplay = body.relationshipDisplay
  else
    employee.relationshipDisplay = await PublicDisplayService.getDisplayByName("relationship", PublicDisplay)

  if (body.SIPDisplay !== undefined)
    employee.SIPDisplay = body.SIPDisplay
  else
    employee.SIPDisplay = await PublicDisplayService.getDisplayByName("SIP", PublicDisplay)

  if (body.notesDisplay !== undefined)
    employee.notesDisplay = body.notesDisplay
  else
    employee.notesDisplay = await PublicDisplayService.getDisplayByName("notes", PublicDisplay)
}

const validationEvent = (event) => {
  console.log(event)
  if (!event) return new ErrorResponseWithCode(
    "Employee",
    "Event",
    "Event is empty.",
    SERVER_ERRORS.EMPLOYEE_EVENT_EMPTY
  )
  var eventRE = /^([0-9]{4})[\/-](0?[1-9]|1[0-2])[\/-](0?[1-9]|[1-2][0-9]|3[01])/;
  if (!event.match(eventRE))
    return new ErrorResponseWithCode(
      "Employee",
      "Event",
      "Event is not valid.",
      SERVER_ERRORS.EMPLOYEE_EVENT_NOT_VALID
    )
}

const validationPhone = (phone, type) => {
  if (!phone) return
  new ErrorResponseWithCode(
    "createEmployee",
    type,
    type + " is empty.",
    type === "Phone" ? SERVER_ERRORS.EMPLOYEE_PHONE_EMPTY : SERVER_ERRORS.EMPLOYEE_IM_ACCOUNT_EMPTY
  )
  var phoneno = /^([0-9]{3}|[0-9]{4})[-. ]?([0-9]{3}|[0-9]{4})([-. ]?([0-9]{3}))?$/;
  if (!phone.match(phoneno))
    return new ErrorResponseWithCode(
      "createEmployee",
      type,
      type + " is not valid.",
      type === "Phone" ? SERVER_ERRORS.EMPLOYEE_PHONE_NOT_VALID : SERVER_ERRORS.EMPLOYEE_IM_ACCOUNT_NOT_VALID
    )
}
const validationEmail = (email) => {
  if (!email) return new ErrorResponseWithCode(
    "createEmployee",
    "email",
    "Email is empty.",
    SERVER_ERRORS.EMPLOYEE_EMAIL_EMPTY
  )
  var emailno = /(?:[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (!email.match(emailno))
    return new ErrorResponseWithCode(
      "createEmployee",
      "email",
      "Email is not valid.",
      SERVER_ERRORS.EMPLOYEE_EMAIL_NOT_VALID
    )
}
const checkIdAndCivilId = async (arrayError, id, civilId, Employee) => {
  if (id) {
    const employees1 = await Employee.find({ id: id }, {})
    if (employees1.length !== 0) {
      arrayError.push(new ErrorResponseWithCode(
        "createEmployee",
        "Id",
        `Employee ${id} is already existed`,
        SERVER_ERRORS.EMPLOYEE_ID_EXIST
      ))
    }
  }
  if (civilId) {
    const employees = await Employee.find({ civilId: civilId }, {})
    if (employees.length !== 0) {
      arrayError.push(new ErrorResponseWithCode(
        "createEmployee",
        "Civil Id",
        `Employee ${civilId} is already existed`,
        SERVER_ERRORS.EMPLOYEE_CIVIL_ID_EXIST
      ))
    }
  }
}
const checkEditIdAndCivilId = async (arrayError, id, civilId, Employee) => {
  if (id) {
    const employees1 = await Employee.find({ id: id }, {})
    if (!(employees1.length === 0 || (employees1.length === 1 && employees1[0].id === id))) {
      arrayError.push(new ErrorResponseWithCode(
        "updateEmployee",
        "id",
        `Employee ${id} is exist already`,
        SERVER_ERRORS.EMPLOYEE_ID_EXIST
      ))
    }
  }
  if (civilId) {
    const employees2 = await Employee.find({ civilId: civilId }, {})
    if (!(employees2.length === 0 || (employees2.length === 1 && employees2[0].civilId === civilId))) {
      arrayError.push(new ErrorResponseWithCode(
        "updateEmployee",
        "Civil id",
        `Employee ${civilId} is exist already`,
        SERVER_ERRORS.EMPLOYEE_CIVIL_ID_EXIST
      ))
    }
  }
}
const checkFromCountryCode = async (phones, CountryCode) => {
  const countryCode = await CountryCodeService.get(CountryCode);
  const result = phones.map(phone => phone.code && phone.code !== "" ? phone : { ...phone, code: countryCode })
  return result;
}
module.exports = {
  createEmployee: async (requestBody, connection, tenantId) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let arrayError = [];
          const Employee = getEmployeeModel(connection)
          await checkOfEmployee(requestBody, arrayError, "create", Employee)
          if (arrayError.length !== 0) {
            throw createError.BadRequest({
              array_error: arrayError,
              code: SERVER_ERRORS.EMPLOYEE_EMPTY
            })
          }
          let qrcode = '';
          const CountryCode = getCountryCodeModel(connection)
          const phones = await checkFromCountryCode(requestBody.phone, CountryCode)
          let employee = new Employee({
            'id': requestBody.id,
            'civilId': requestBody.civilId,
            'name': requestBody.name,
            'status': requestBody.status,
            'qrcode': qrcode,
            'organization': requestBody.organization,
            phone: phones,
            email: requestBody.email
          });
          const PublicDisplay = getPublicDisplayModel(connection)
          await setDisplay(employee, requestBody, PublicDisplay)
          if (requestBody.address) {
            const address = requestBody.address.filter(
              item => !(
                item.street === "" &&
                item.POBox === "" &&
                item.neighborhood === "" &&
                item.city === "" &&
                item.state === "" &&
                item.zipCode === "" &&
                item.country === "")
            )
            if (address && address.length !== 0) employee.address = address;
          }
          if (requestBody.IMAccount) {
            const IMAccount = requestBody.IMAccount.filter(item => item.info != "")
            if (IMAccount && IMAccount.length !== 0) employee.IMAccount = IMAccount;
          }
          if (requestBody.website) {
            const website = requestBody.website.filter(item => item.info != "")
            if (website && website.length !== 0) employee.website = website;
          }
          if (requestBody.event) {
            const event = requestBody.event.filter(item => item.info != null && item.info != "")
            if (event && event.length !== 0) employee.event = event;
          }
          if (requestBody.relationship) {
            const relationship = requestBody.relationship.filter(item => item.info != "")
            if (relationship && relationship.length !== 0) employee.relationship = relationship;
          }
          if (requestBody.SIP) {
            const SIP = requestBody.SIP.filter(item => item.info != "")
            if (SIP && SIP.length !== 0) employee.SIP = SIP;
          }
          const notes = requestBody.notes
          if (notes !== "") employee.notes = notes;
          if (requestBody.fields) {
            const fields = requestBody.fields.filter(item => item.info != "")
            if (fields && fields.length !== 0) employee.fields = fields;
          }
          if (requestBody.image) employee.image = requestBody.image;
          //const validation_result = await EmployeeSchema.validateAsync(employee);
          await QRCode.toDataURL(process.env.BASEURL + '/empid?&id=' + employee._id + '&tenant=' + tenantId, async function (err, url) {
            try {
              qrcode = url;
              employee.qrcode = qrcode;
              const result = await employee.save();
              resolve(new SuccessResponse(true, result));
            } catch (error) {
              reject(createError.BadRequest({
                array_error: [
                  new ErrorResponseWithCode(
                    "createEmployee",
                    "Employee",
                    error.toString(),
                    SERVER_ERRORS.EMPLOYEE_ID_EXIST
                  ),
                ],
                code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
              }));
            }
          })
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  updateEmployee: async (id, requestBody, connection) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let arrayError = [];
          const Employee = getEmployeeModel(connection)
          await checkOfEmployee(requestBody, arrayError, "edit", Employee)
          if (arrayError.length !== 0) {
            throw createError.BadRequest({
              array_error: arrayError,
              code: SERVER_ERRORS.EMPLOYEE_EMPTY,
            })
          }
          let employee = await Employee.findById(id);

          if (!requestBody.name || !requestBody.name.first || !requestBody.name.last)
            throw createError.Conflict({
              array_error: [
                new ErrorResponseWithCode(
                  "createEmployee",
                  "name",
                  `Employee name is empty`,
                  SERVER_ERRORS.EMPLOYEE_NAME_EMPTY
                ),
              ],
              code: SERVER_ERRORS.EMPLOYEE_NAME_EMPTY,
            });

          employee.id = requestBody.id
          employee.civilId = requestBody.civilId
          employee.name = requestBody.name
          employee.status = requestBody.status
          employee.organization = requestBody.organization
          const PublicDisplay = getPublicDisplayModel(connection)
          await setDisplay(employee, requestBody, PublicDisplay)
          if (requestBody.phone && requestBody.phone.length !== 0) {
            employee.phone = requestBody.phone.filter(item => item.info !== "+")
          }
          else throw createError.BadRequest({
            array_error: [
              new ErrorResponseWithCode(
                "updateEmployee",
                "Employee",
                "There is not phone",
                SERVER_ERRORS.EMPLOYEE_PHONE_EMPTY
              ),
            ],
            code: SERVER_ERRORS.EMPLOYEE_PHONE_EMPTY,
          })
          if (requestBody.email && requestBody.email.length !== 0) {
            employee.email = requestBody.email
          }
          else throw createError.BadRequest({
            array_error: [
              new ErrorResponseWithCode(
                "updateEmployee",
                "Employee",
                "There is not email",
                SERVER_ERRORS.EMPLOYEE_EMAIL_EMPTY
              ),
            ],
            code: SERVER_ERRORS.EMPLOYEE_EMAIL_EMPTY,
          })

          if (requestBody.address) {
            const address = requestBody.address.filter(
              item => !(
                item.street === "" &&
                item.POBox === "" &&
                item.neighborhood === "" &&
                item.city === "" &&
                item.state === "" &&
                item.zipCode === "" &&
                item.country === "")
            )
            if (address && address.length !== 0) employee.address = address;
            else employee.address = [];
          }

          if (requestBody.IMAccount) {
            const IMAccount = requestBody.IMAccount.filter(item => item.info !== "" && item.info !== "+")
            if (IMAccount && IMAccount.length !== 0) employee.IMAccount = IMAccount;
            else employee.IMAccount = [];
          }

          if (requestBody.website) {
            const website = requestBody.website.filter(item => item.info != "")
            if (website && website.length !== 0) employee.website = website;
            else employee.website = [];
          }

          if (requestBody.event) {
            const event = requestBody.event.filter(item => item.info != null && item.info != "")
            if (event && event.length !== 0) employee.event = event;
            else employee.event = [];
          }
          if (requestBody.relationship) {
            const relationship = requestBody.relationship.filter(item => item.info != "")
            if (relationship && relationship.length !== 0) employee.relationship = relationship;
            else employee.relationship = [];
          }

          if (requestBody.SIP) {
            const SIP = requestBody.SIP.filter(item => item.info != "")
            if (SIP && SIP.length !== 0) employee.SIP = SIP;
            else employee.SIP = [];
          }

          const notes = requestBody.notes
          if (notes !== "") employee.notes = notes;
          else employee.notes = "";

          if (requestBody.fields) {
            const fields = requestBody.fields.filter(item => item.info != "")
            if (fields && fields.length !== 0) employee.fields = fields;
            else employee.fields = [];
          }

          if (requestBody.image) employee.image = requestBody.image;
          else employee.image = "";
          const options = { new: true };
          const result = await Employee.findByIdAndUpdate(id, employee, options);
          if (!result) throw createError.BadRequest({
            array_error: [
              new ErrorResponseWithCode(
                "updateEmployee",
                "Employee",
                "Employee is not valid",
                SERVER_ERRORS.EMPLOYEE_EMPTY
              )
            ],
            code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
          })
          resolve(new SuccessResponse(true, result));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  deleteEmployee: async (employeeId, connection) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const Employee = getEmployeeModel(connection)
          const result = await Employee.findByIdAndDelete(employeeId);
          if (!result) throw createError(404, "employee does not exist.");
          if (result.image && result.image !== "") {
            const path = './images/' + result.image;
            try {
              fs.unlinkSync(path)
            } catch (err) {
              console.error(err)
            }
          }
          resolve(new SuccessResponse(true, {}));
        } catch (error) {
          console.log(error);
          reject(error);
        }
      })();
    });
  },
  getVCard: async (employee) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const myVCard = new VCard();
          myVCard.addName(employee.name.last,
            employee.name.first,
            employee.name.middle,
            employee.name.prefix,
            employee.name.suffix)
          employee.phone.forEach(element => {
            myVCard.addPhoneNumber(element.code + element.info, element.type)
          });
          employee.email.forEach(element => {
            myVCard.addEmail(element.info, element.type)
          });
          employee.address.forEach(element => {
            myVCard.addAddress(element.POBox, "", element.street, element.city, element.state, element.zipCode, element.country, element.type)
          });
          if (employee.event.length !== 0) myVCard.addBirthday(employee.event[0].info)
          employee.website.forEach(element => {
            myVCard.addURL(element.info)
          });
          if (employee.notes)
            myVCard.addNote(employee.notes)
          myVCard.addCompany(employee.organization.company + ";" + employee.organization.department)
          myVCard.addJobtitle(employee.organization.jobTitle)
          if (employee.image) {
            const imagePath = './images/' + employee.image;
            if (fs.existsSync(imagePath)) {
              const image = fs.readFileSync(imagePath, { encoding: 'base64', flag: 'r' })
              myVCard.addPhoto(image);
            }
          }
          resolve(myVCard.toString());
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  getExcelHeadingStyle: () => {
    return {
      font: {
        color: '#000000',
        size: 14,
        bold: true,
        bgColor: '#82e8f5'
      }
    };
  },
  filterEmployeeByDisplays: (employee, connection) => {
    try {
      const Employee = getEmployeeModel(connection)
      let resultEmployee = new Employee();
      resultEmployee._id = employee._id;
      resultEmployee.qrcode = employee.qrcode;
      resultEmployee.name = employee.name;
      if (employee.organizationDisplay) resultEmployee.organization = employee.organization;
      if (employee.imageDisplay) resultEmployee.image = employee.image;
      if (employee.emailDisplay) resultEmployee.email = employee.email;
      if (employee.phoneDisplay) resultEmployee.phone = employee.phone;
      if (employee.addressDisplay) resultEmployee.address = employee.address;
      if (employee.IMAccountDisplay) resultEmployee.IMAccount = employee.IMAccount;
      if (employee.websiteDisplay) resultEmployee.website = employee.website;
      if (employee.eventDisplay) resultEmployee.event = employee.event;
      if (employee.relationshipDisplay) resultEmployee.relationship = employee.relationship;
      if (employee.SIPDisplay) resultEmployee.SIP = employee.SIP;
      if (employee.notesDisplay) resultEmployee.notes = employee.notes;
      let fields = [];
      if (employee.fields) {
        employee.fields.forEach(element => {
          if (element.display) fields.push(element);
        });
      }
      resultEmployee.fields = fields;
      return resultEmployee;
    } catch (error) {
      return "error " + error;
    }
  },
  getExcelStyle: () => {
    return {
      font: {
        color: '#000000',
        size: 12,
      }
    };
  },
  getExcelHeading: async (ws, style) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let columnCounter = 1;
          ws.cell(1, columnCounter++)
            .string("Id")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Civil Id")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Status')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Prefix")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("First")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Middle')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Last")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Suffix")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Phone')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Email")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Job Title")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Department')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Company")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Street")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('POBox')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Neighborhood")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("City")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('State')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Zip Code")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Country")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('IM Account')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Website')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Event')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Relationship')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('SIP')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Notes')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Image')
            .style(style);
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  getExcelErrorsHeading: async (ws, style) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let columnCounter = 28;
          ws.cell(1, columnCounter++)
            .string("Error")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('ErrorDetails')
            .style(style);
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  getExcelEmployee: (ws, style, employee, row) => {
    try {
      let columnCounter = 1;
      ws.cell(row, columnCounter++)
        .string(employee.id ? employee.id.toString() : "")
        .style(style);
      ws.cell(row, columnCounter++)
        .string(employee.civilId ? employee.civilId.toString() : "")
        .style(style);
      ws.cell(row, columnCounter++)
        .string(employee.status ? employee.status : "")
        .style(style);
      if (employee.name) {
        ws.cell(row, columnCounter++)
          .string(employee.name.prefix)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.name.first)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.name.middle)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.name.last)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.name.suffix)
          .style(style);
      }
      else columnCounter += 5
      ws.cell(row, columnCounter++)
        .string((convertPhoneToString(employee.phone)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertEmailToString(employee.email)).toString())
        .style(style);
      if (employee.organization) {
        ws.cell(row, columnCounter++)
          .string(employee.organization.jobTitle)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.organization.department)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.organization.company)
          .style(style);
      }
      else columnCounter += 3;
      let address = convertAddressToString(employee.address)
      address = address.result
      ws.cell(row, columnCounter++)
        .string(address.street)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.POBox)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.neighborhood)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.city)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.state)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.zipCode)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.country)
        .style(style);

      ws.cell(row, columnCounter++)
        .string((convertPhoneToString(employee.IMAccount)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertArrayToString(employee.website)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertArrayToString(employee.event)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertEmailToString(employee.relationship)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertArrayToString(employee.SIP)).toString())
        .style(style);
      if (employee.notes)
        ws.cell(row, columnCounter++)
          .string(employee.notes)
          .style(style);
      else columnCounter += 1;
      //const imagePath = './images/'+employee.image;
      if (employee.image && employee.image !== "")
        ws.cell(row, columnCounter++)
          .string(IMAGES_API_URL + employee.image)
          .style(style);
      /*if (fs.existsSync(imagePath)) {
        const image = fs.readFileSync(imagePath, { encoding: 'base64', flag: 'r' })
        ws.cell(row, columnCounter++)
          .string(image)
          .style(style);
      }*/
    } catch (error) {
      return error;
    }
  },
  getExcelError: async (ws, style, error, row) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          error = error.array_error;
          let columnCounter = 28;
          ws.cell(row, columnCounter++)
            .string(!error ? "" : error.reduce((accumulator, currentValue) => ({ location_type: accumulator.location_type + ' ,' + currentValue.location_type })).location_type)
            .style(style);
          ws.cell(row, columnCounter++)
            .string(!error ? "" : error.reduce((accumulator, currentValue) => ({ message: accumulator.message + ' ,' + currentValue.message })).message)
            .style(style);
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  convertExcelToEmployee: (item, connection) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const Employee = getEmployeeModel(connection)
          if (item.length === 0)
            reject(createError.BadRequest({
              array_error: [
                new ErrorResponse(
                  "createEmployee",
                  "Employee",
                  "row is empty"
                ),
              ],
              code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
            }));
          const countryCode = await CountryCodeService.get();
          let employee = new Employee()
          let counter = 0;
          let id = Number(item[counter++])
          let civilId = Number(item[counter++])
          employee.id = id;
          employee.civilId = civilId;
          employee.status = item[counter++]
          if (item[4] !== undefined && item[6] !== undefined)
            employee.name = {
              prefix: item[counter++],
              first: item[counter++],
              middle: item[counter++],
              last: item[counter++],
              suffix: item[counter++]
            }
          else counter += 5
          if (item[counter++]) {
            let phones = item[counter - 1]
            if (phones) {
              phones = phones + ""
              phones = phones.split(";")
              phones = phones.map(phone => phone.split(","))
              phones = phones.map((phone) => ({ info: phone[1], type: phone[2] !== "" ? phone[2] : "Home", code: phone[0] !== "" ? "+" + phone[0] : countryCode }))
              employee.phone = phones;
            }
          }
          if (item[counter++]) {
            let emails = item[counter - 1]
            if (emails) {
              emails = emails.split(";")
              emails = emails.map(email => email.split(","))
              emails = emails.map(email => ({ info: email[0], type: email[1] && email[1] !== "" ? email[1] : "Home" }))
              employee.email = emails;
            }
          }

          let organization = {}
          if (item[counter++])
            organization.jobTitle = item[counter - 1]
          if (item[counter++])
            organization.department = item[counter - 1]
          if (item[counter++])
            organization.company = item[counter - 1]
          let street = item[counter++] ? item[counter++].split(";") : undefined
          let POBox = item[counter++] ? item[counter++].split(";") : undefined
          let neighborhood = item[counter++] ? item[counter++].split(";") : undefined
          let city = item[counter++] ? item[counter++].split(";") : undefined
          let state = item[counter++] ? item[counter++].split(";") : undefined
          let zipCode = item[counter++] ? item[counter++].split(";") : undefined
          let country = item[counter++] ? item[counter++].split(";") : undefined
          let address = []
          if (street)
            street.map((adr, index) => {
              address.push({
                street: street[index],
                POBox: POBox[index],
                neighborhood: neighborhood[index],
                city: city[index], state: state[index],
                zipCode: zipCode[index],
                country: country[index], type: "Home"
              })
            })
          employee.address = address;

          if (item[counter++]) {
            let IMAccount = item[20]
            if (IMAccount) {
              IMAccount = IMAccount.split(";")
              IMAccount = IMAccount.map(account => account.split(","))
              IMAccount = IMAccount.map(account => ({ info: account[1], type: account[2] !== "" ? account[2] : "WhatsApp", code: account[0] !== "" ? "+" + account[0] : countryCode }))
              employee.IMAccount = IMAccount;
            }
          }
          if (item[counter++]) {
            let websites = item[21]
            if (websites) {
              websites = websites.split(";")
              websites = websites.map(website => ({ info: website }))
              employee.website = websites;
            }
          }
          if (item[counter++]) {
            let events = item[counter - 1]
            if (events) {
              events = events.split(";")
              events = events.map(event => event.split(","))
              events = events.map(event => ({ info: event[0], type: event[1] && event[1] !== "" ? event[1] : "Birthday" }))
              employee.event = events;
            }
          }
          if (item[counter++]) {
            let relationships = item[counter - 1]
            if(relationships)
            {
              relationships = relationships.split(";")
              relationships = relationships.map(relationship => relationship.split(","))
            relationships = relationships.map(relationship => ({ info: relationship[0], type: relationship[1] && relationship[1] !== "" ? relationship[1] : "Parent" }))
            employee.relationship = relationships;}
          }
          if (item[counter++]) {
            let SIP = item[counter - 1]
            if(SIP)
            {
              SIP = SIP.split(";")
              SIP = SIP.map(s => ({ info: s }))
            employee.SIP = SIP;}
          }
          if (Object.keys(organization).length !== 0)
            employee.organization = organization;
          let notes = item[counter++]
          employee.notes = notes;
          let image = item[counter++];
          if (image) {
            /*const buf = Buffer.from(image, 'base64')
            const imageName = Date.now()+Math.random() * 1000+".png"
            const imagePath = './images/'+imageName;
            fs.writeFile(imagePath, buf, function (err) {
              if (err) throw err;
            });*/
            employee.image = image.replace(IMAGES_API_URL, "");
          }
          resolve(employee)
        } catch (error) {
          reject(createError.BadRequest({
            array_error: [
              new ErrorResponse(
                "createEmployee",
                "Employee",
                error.toString()
              ),
            ],
            code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
          }));
        }
      })()
    })
  }
};
/*const { ErrorResponseWithCode, SuccessResponse, ErrorResponse } = require("../Helpers/Response.Helper");
const createError = require("http-errors");
const VCard = require('vcard-creator').default
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
var QRCode = require('qrcode');
const path = require('path');
//const Employee = require("../Models/Employee.model");
const fs = require('fs');
const PublicDisplayService = require("./PublicDisplay.Service");
const CountryCodeService = require("./CountryCode.Service");
const IMAGES_API_URL = process.BASEURL + '/'
const modelName = "Employee"
const schema = require("../Models/Employee.model")
const getEmployeeModel = (connection) => {
  return connection.model(modelName, schema)
}
const modelNameCountryCode = "CountryCode"
const schemaCountryCode = require("../Models/CountryCode.model")
const getCountryCodeModel = (connection) => {
  return connection.model(modelNameCountryCode, schemaCountryCode)
}
const modelNamePublicDisplay = "PublicDisplay"
const schemaPublicDisplay = require("../Models/PublicDisplay.model")
const getPublicDisplayModel = (connection) => {
  return connection.model(modelNamePublicDisplay, schemaPublicDisplay)
}
const convertArrayToString = (array) => {
  try {
    let result = "";
    array.map(element => {
      result += element.info + ";";
    });
    return result === "" ? "" : result.substring(0, result.length - 1)
  } catch (error) {
    return "error" + error;
  }
}
const convertEmailToString = (array) => {
  try {
    let result = "";
    array.map(element => {
      result += element.info + "," + element.type + ";";
    });
    return result === "" ? "" : result.substring(0, result.length - 1)
  } catch (error) {
    return "error" + error;
  }
}
const convertPhoneToString = (array) => {
  try {
    let result = "";
    array.map(element => {
      result += element.code.slice(1) + "," + element.info + "," + element.type + ";";
    });
    return result === "" ? "" : result.substring(0, result.length - 1)
  } catch (error) {
    return "error" + error;
  }
}
const convertAddressToString = (array) => {
  try {
    let result = { street: "", POBox: "", neighborhood: "", city: "", state: "", zipCode: "", country: "" };
    array.map(element => {
      result.street += element.street + ";";
      result.POBox += element.POBox + ";";
      result.neighborhood += element.neighborhood + ";";
      result.city += element.city + ";";
      result.state += element.state + ";";
      result.zipCode += element.zipCode + ";";
      result.country += element.country + ";";
    });
    if (result.street !== "") result = { ...result, street: result.street.substring(0, result.street.length - 1) }
    if (result.POBox !== "") result = { ...result, POBox: result.POBox.substring(0, result.POBox.length - 1) }
    if (result.neighborhood !== "") result = { ...result, neighborhood: result.neighborhood.substring(0, result.neighborhood.length - 1) }
    if (result.city !== "") result = { ...result, city: result.city.substring(0, result.city.length - 1) }
    if (result.state !== "") result = { ...result, state: result.state.substring(0, result.state.length - 1) }
    if (result.zipCode !== "") result = { ...result, zipCode: result.zipCode.substring(0, result.zipCode.length - 1) }
    if (result.country !== "") result = { ...result, country: result.country.substring(0, result.country.length - 1) }
    return { result: result }
  } catch (error) {
    return "error" + error;
  }
}
const checkOfEmployee = async (employee, arrayError, type, Employee) => {
  if (!employee) {
    arrayError.push(new ErrorResponseWithCode(
      "createEmployee",
      "Employee",
      "employee can not be empty.",
      SERVER_ERRORS.EMPLOYEE_EMPTY
    ))
    return;
  }
  if (type === "edit")
    await checkEditIdAndCivilId(arrayError, employee.id, employee.civilId, Employee)
  else
    await checkIdAndCivilId(arrayError, employee.id, employee.civilId, Employee)
  if (!employee.name || !employee.name.first || !employee.name.last) {
    arrayError.push(new ErrorResponseWithCode(
      "createEmployee",
      "name",
      `Employee name is empty`,
      SERVER_ERRORS.EMPLOYEE_NAME_EMPTY
    ))
  }
  employee.phone.map(phone => {
    const result = validationPhone(phone.info, "Phone")
    if (result) arrayError.push(result)
  });
  if (employee.phone && employee.phone.length === 0) {
    arrayError.push(new ErrorResponseWithCode(
      "createEmployee",
      "Phone",
      "There is no mobile number",
      SERVER_ERRORS.EMPLOYEE_PHONE_EMPTY
    ))
  }
  employee.email.map(email => {
    const result = validationEmail(email.info)
    if (result) arrayError.push(result)
  });
  if (employee.email && employee.email.length === 0) {
    arrayError.push(new ErrorResponseWithCode(
      "createEmployee",
      "Email",
      "There is no email address",
      SERVER_ERRORS.EMPLOYEE_EMAIL_EMPTY
    ))
  }
  employee.IMAccount?.filter(IMAccount => IMAccount.info !== "").map(IMAccount => {
    const result = validationPhone(IMAccount.info, "IM account")
    if (result) arrayError.push(result)
  });
  employee.event?.map(event => {
    const result = validationEvent(event.info)
    if (result) arrayError.push(result)
  })
}

const setDisplay = async (employee, body, PublicDisplay) => {
  if (body.imageDisplay !== undefined)
    employee.imageDisplay = body.imageDisplay
  else
    employee.imageDisplay = await PublicDisplayService.getDisplayByName("image", PublicDisplay)
  if (body.organizationDisplay !== undefined)
    employee.organizationDisplay = body.organizationDisplay
  else
    employee.organizationDisplay = await PublicDisplayService.getDisplayByName("organization", PublicDisplay)

  if (body.phoneDisplay !== undefined)
    employee.phoneDisplay = body.phoneDisplay
  else
    employee.phoneDisplay = await PublicDisplayService.getDisplayByName("phone", PublicDisplay)

  if (body.emailDisplay !== undefined)
    employee.emailDisplay = body.emailDisplay
  else
    employee.emailDisplay = await PublicDisplayService.getDisplayByName("email", PublicDisplay)

  if (body.addressDisplay !== undefined)
    employee.addressDisplay = body.addressDisplay
  else
    employee.addressDisplay = await PublicDisplayService.getDisplayByName("address", PublicDisplay)

  if (body.IMAccountDisplay !== undefined)
    employee.IMAccountDisplay = body.IMAccountDisplay
  else
    employee.IMAccountDisplay = await PublicDisplayService.getDisplayByName("IMAccount", PublicDisplay)

  if (body.websiteDisplay !== undefined)
    employee.websiteDisplay = body.websiteDisplay
  else
    employee.websiteDisplay = await PublicDisplayService.getDisplayByName("website", PublicDisplay)

  if (body.eventDisplay !== undefined)
    employee.eventDisplay = body.eventDisplay
  else
    employee.eventDisplay = await PublicDisplayService.getDisplayByName("event", PublicDisplay)

  if (body.relationshipDisplay !== undefined)
    employee.relationshipDisplay = body.relationshipDisplay
  else
    employee.relationshipDisplay = await PublicDisplayService.getDisplayByName("relationship", PublicDisplay)

  if (body.SIPDisplay !== undefined)
    employee.SIPDisplay = body.SIPDisplay
  else
    employee.SIPDisplay = await PublicDisplayService.getDisplayByName("SIP", PublicDisplay)

  if (body.notesDisplay !== undefined)
    employee.notesDisplay = body.notesDisplay
  else
    employee.notesDisplay = await PublicDisplayService.getDisplayByName("notes", PublicDisplay)
}

const validationEvent = (event) => {
  console.log(event)
  if (!event) return new ErrorResponseWithCode(
    "Employee",
    "Event",
    "Event is empty.",
    SERVER_ERRORS.EMPLOYEE_EVENT_EMPTY
  )
  var eventRE = /^([0-9]{4})[\/-](0?[1-9]|1[0-2])[\/-](0?[1-9]|[1-2][0-9]|3[01])/;
  if (!event.match(eventRE))
    return new ErrorResponseWithCode(
      "Employee",
      "Event",
      "Event is not valid.",
      SERVER_ERRORS.EMPLOYEE_EVENT_NOT_VALID
    )
}

const validationPhone = (phone, type) => {
  if (!phone) return
  new ErrorResponseWithCode(
    "createEmployee",
    type,
    type + " is empty.",
    type === "Phone" ? SERVER_ERRORS.EMPLOYEE_PHONE_EMPTY : SERVER_ERRORS.EMPLOYEE_IM_ACCOUNT_EMPTY
  )
  var phoneno = /^([0-9]{3}|[0-9]{4})[-. ]?([0-9]{3}|[0-9]{4})([-. ]?([0-9]{3}))?$/;
  if (!phone.match(phoneno))
    return new ErrorResponseWithCode(
      "createEmployee",
      type,
      type + " is not valid.",
      type === "Phone" ? SERVER_ERRORS.EMPLOYEE_PHONE_NOT_VALID : SERVER_ERRORS.EMPLOYEE_IM_ACCOUNT_NOT_VALID
    )
}
const validationEmail = (email) => {
  if (!email) return new ErrorResponseWithCode(
    "createEmployee",
    "email",
    "Email is empty.",
    SERVER_ERRORS.EMPLOYEE_EMAIL_EMPTY
  )
  var emailno = /(?:[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (!email.match(emailno))
    return new ErrorResponseWithCode(
      "createEmployee",
      "email",
      "Email is not valid.",
      SERVER_ERRORS.EMPLOYEE_EMAIL_NOT_VALID
    )
}
const checkIdAndCivilId = async (arrayError, id, civilId, Employee) => {
  if (id) {
    const employees1 = await Employee.find({ id: id }, {})
    if (employees1.length !== 0) {
      arrayError.push(new ErrorResponseWithCode(
        "createEmployee",
        "Id",
        `Employee ${id} is already existed`,
        SERVER_ERRORS.EMPLOYEE_ID_EXIST
      ))
    }
  }
  if (civilId) {
    const employees = await Employee.find({ civilId: civilId }, {})
    if (employees.length !== 0) {
      arrayError.push(new ErrorResponseWithCode(
        "createEmployee",
        "Civil Id",
        `Employee ${civilId} is already existed`,
        SERVER_ERRORS.EMPLOYEE_CIVIL_ID_EXIST
      ))
    }
  }
}
const checkEditIdAndCivilId = async (arrayError, id, civilId, Employee) => {
  if (id) {
    const employees1 = await Employee.find({ id: id }, {})
    if (!(employees1.length === 0 || (employees1.length === 1 && employees1[0].id === id))) {
      arrayError.push(new ErrorResponseWithCode(
        "updateEmployee",
        "id",
        `Employee ${id} is exist already`,
        SERVER_ERRORS.EMPLOYEE_ID_EXIST
      ))
    }
  }
  if (civilId) {
    const employees2 = await Employee.find({ civilId: civilId }, {})
    if (!(employees2.length === 0 || (employees2.length === 1 && employees2[0].civilId === civilId))) {
      arrayError.push(new ErrorResponseWithCode(
        "updateEmployee",
        "Civil id",
        `Employee ${civilId} is exist already`,
        SERVER_ERRORS.EMPLOYEE_CIVIL_ID_EXIST
      ))
    }
  }
}
const checkFromCountryCode = async (phones, CountryCode) => {
  const countryCode = await CountryCodeService.get(CountryCode);
  const result = phones.map(phone => phone.code && phone.code !== "" ? phone : { ...phone, code: countryCode })
  return result;
}
module.exports = {
  createEmployee: async (requestBody, connection, tenantId) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let arrayError = [];
          const Employee = getEmployeeModel(connection)
          await checkOfEmployee(requestBody, arrayError, "create", Employee)
          if (arrayError.length !== 0) {
            throw createError.BadRequest({
              array_error: arrayError,
              code: SERVER_ERRORS.EMPLOYEE_EMPTY
            })
          }
          let qrcode = '';
          const CountryCode = getCountryCodeModel(connection)
          const phones = await checkFromCountryCode(requestBody.phone, CountryCode)
          let employee = new Employee({
            'id': requestBody.id,
            'civilId': requestBody.civilId,
            'name': requestBody.name,
            'status': requestBody.status,
            'qrcode': qrcode,
            'organization': requestBody.organization,
            phone: phones,
            email: requestBody.email
          });
          const PublicDisplay = getPublicDisplayModel(connection)
          await setDisplay(employee, requestBody, PublicDisplay)
          const address = requestBody.address?.filter(
            item => !(
              item.street === "" &&
              item.POBox === "" &&
              item.neighborhood === "" &&
              item.city === "" &&
              item.state === "" &&
              item.zipCode === "" &&
              item.country === "")
          )
          if (address?.length !== 0) employee.address = address;

          const IMAccount = requestBody.IMAccount?.filter(item => item.info != "")
          if (IMAccount?.length !== 0) employee.IMAccount = IMAccount;
          const website = requestBody.website?.filter(item => item.info != "")
          if (website?.length !== 0) employee.website = website;
          const event = requestBody.event?.filter(item => item.info != null && item.info != "")
          if (event?.length !== 0) employee.event = event;
          const relationship = requestBody.relationship?.filter(item => item.info != "")
          if (relationship?.length !== 0) employee.relationship = relationship;
          const SIP = requestBody.SIP?.filter(item => item.info != "")
          if (SIP?.length !== 0) employee.SIP = SIP;
          const notes = requestBody.notes
          if (notes !== "") employee.notes = notes;
          const fields = requestBody.fields?.filter(item => item.info != "")
          if (fields?.length !== 0) employee.fields = fields;
          if (requestBody.image) employee.image = requestBody.image;
          //const validation_result = await EmployeeSchema.validateAsync(employee);
          await QRCode.toDataURL(process.env.BASEURL + '/empid?&id=' + employee._id + '&tenant=' + tenantId, async function (err, url) {
            try {
              qrcode = url;
              employee.qrcode = qrcode;
              const result = await employee.save();
              resolve(new SuccessResponse(true, result));
            } catch (error) {
              reject(createError.BadRequest({
                array_error: [
                  new ErrorResponseWithCode(
                    "createEmployee",
                    "Employee",
                    error.toString(),
                    SERVER_ERRORS.EMPLOYEE_ID_EXIST
                  ),
                ],
                code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
              }));
            }
          })
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  updateEmployee: async (id, requestBody, connection) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let arrayError = [];
          const Employee = getEmployeeModel(connection)
          await checkOfEmployee(requestBody, arrayError, "edit", Employee)
          if (arrayError.length !== 0) {
            throw createError.BadRequest({
              array_error: arrayError,
              code: SERVER_ERRORS.EMPLOYEE_EMPTY,
            })
          }
          let employee = await Employee.findById(id);

          if (!requestBody.name || !requestBody.name.first || !requestBody.name.last)
            throw createError.Conflict({
              array_error: [
                new ErrorResponseWithCode(
                  "createEmployee",
                  "name",
                  `Employee name is empty`,
                  SERVER_ERRORS.EMPLOYEE_NAME_EMPTY
                ),
              ],
              code: SERVER_ERRORS.EMPLOYEE_NAME_EMPTY,
            });

          employee.id = requestBody.id
          employee.civilId = requestBody.civilId
          employee.name = requestBody.name
          employee.status = requestBody.status
          employee.organization = requestBody.organization
          const PublicDisplay = getPublicDisplayModel(connection)
          await setDisplay(employee, requestBody, PublicDisplay)
          if (requestBody.phone && requestBody.phone.length !== 0) {
            employee.phone = requestBody.phone.filter(item => item.info !== "+")
          }
          else throw createError.BadRequest({
            array_error: [
              new ErrorResponseWithCode(
                "updateEmployee",
                "Employee",
                "There is not phone",
                SERVER_ERRORS.EMPLOYEE_PHONE_EMPTY
              ),
            ],
            code: SERVER_ERRORS.EMPLOYEE_PHONE_EMPTY,
          })
          if (requestBody.email && requestBody.email.length !== 0) {
            employee.email = requestBody.email
          }
          else throw createError.BadRequest({
            array_error: [
              new ErrorResponseWithCode(
                "updateEmployee",
                "Employee",
                "There is not email",
                SERVER_ERRORS.EMPLOYEE_EMAIL_EMPTY
              ),
            ],
            code: SERVER_ERRORS.EMPLOYEE_EMAIL_EMPTY,
          })

          const address = requestBody.address?.filter(
            item => !(
              item.street === "" &&
              item.POBox === "" &&
              item.neighborhood === "" &&
              item.city === "" &&
              item.state === "" &&
              item.zipCode === "" &&
              item.country === "")
          )
          if (address?.length !== 0) employee.address = address;
          else employee.address = [];

          const IMAccount = requestBody.IMAccount?.filter(item => item.info !== "" && item.info !== "+")
          if (IMAccount?.length !== 0) employee.IMAccount = IMAccount;
          else employee.IMAccount = [];

          const website = requestBody.website?.filter(item => item.info != "")
          if (website?.length !== 0) employee.website = website;
          else employee.website = [];

          const event = requestBody.event?.filter(item => item.info != null && item.info != "")
          if (event?.length !== 0) employee.event = event;
          else employee.event = [];

          const relationship = requestBody.relationship?.filter(item => item.info != "")
          if (relationship?.length !== 0) employee.relationship = relationship;
          else employee.relationship = [];

          const SIP = requestBody.SIP?.filter(item => item.info != "")
          if (SIP?.length !== 0) employee.SIP = SIP;
          else employee.SIP = [];

          const notes = requestBody.notes
          if (notes !== "") employee.notes = notes;
          else employee.notes = "";

          const fields = requestBody.fields?.filter(item => item.info != "")
          if (fields?.length !== 0) employee.fields = fields;
          else employee.fields = [];

          if (requestBody.image) employee.image = requestBody.image;
          else employee.image = "";
          const options = { new: true };
          const result = await Employee.findByIdAndUpdate(id, employee, options);
          if (!result) throw createError.BadRequest({
            array_error: [
              new ErrorResponseWithCode(
                "updateEmployee",
                "Employee",
                "Employee is not valid",
                SERVER_ERRORS.EMPLOYEE_EMPTY
              )
            ],
            code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
          })
          resolve(new SuccessResponse(true, result));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  deleteEmployee: async (employeeId, connection) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const Employee = getEmployeeModel(connection)
          const result = await Employee.findByIdAndDelete(employeeId);
          if (!result) throw createError(404, "employee does not exist.");
          if (result.image && result.image !== "") {
            const path = './images/' + result.image;
            try {
              fs.unlinkSync(path)
            } catch (err) {
              console.error(err)
            }
          }
          resolve(new SuccessResponse(true, {}));
        } catch (error) {
          console.log(error);
          reject(error);
        }
      })();
    });
  },
  getVCard: async (employee) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const myVCard = new VCard();
          myVCard.addName(employee.name.last,
            employee.name.first,
            employee.name.middle,
            employee.name.prefix,
            employee.name.suffix)
          employee.phone.forEach(element => {
            myVCard.addPhoneNumber(element.code + element.info, element.type)
          });
          employee.email.forEach(element => {
            myVCard.addEmail(element.info, element.type)
          });
          employee.address.forEach(element => {
            myVCard.addAddress(element.POBox, "", element.street, element.city, element.state, element.zipCode, element.country, element.type)
          });
          if (employee.event.length !== 0) myVCard.addBirthday(employee.event[0].info)
          employee.website.forEach(element => {
            myVCard.addURL(element.info)
          });
          if (employee.notes)
            myVCard.addNote(employee.notes)
          myVCard.addCompany(employee.organization.company + ";" + employee.organization.department)
          myVCard.addJobtitle(employee.organization.jobTitle)
          if (employee.image) {
            const imagePath = './images/' + employee.image;
            if (fs.existsSync(imagePath)) {
              const image = fs.readFileSync(imagePath, { encoding: 'base64', flag: 'r' })
              myVCard.addPhoto(image);
            }
          }
          resolve(myVCard.toString());
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  getExcelHeadingStyle: () => {
    return {
      font: {
        color: '#000000',
        size: 14,
        bold: true,
        bgColor: '#82e8f5'
      }
    };
  },
  filterEmployeeByDisplays: (employee, connection) => {
    try {
      const Employee = getEmployeeModel(connection)
      let resultEmployee = new Employee();
      resultEmployee._id = employee._id;
      resultEmployee.qrcode = employee.qrcode;
      resultEmployee.name = employee.name;
      if (employee.organizationDisplay) resultEmployee.organization = employee.organization;
      if (employee.imageDisplay) resultEmployee.image = employee.image;
      if (employee.emailDisplay) resultEmployee.email = employee.email;
      if (employee.phoneDisplay) resultEmployee.phone = employee.phone;
      if (employee.addressDisplay) resultEmployee.address = employee.address;
      if (employee.IMAccountDisplay) resultEmployee.IMAccount = employee.IMAccount;
      if (employee.websiteDisplay) resultEmployee.website = employee.website;
      if (employee.eventDisplay) resultEmployee.event = employee.event;
      if (employee.relationshipDisplay) resultEmployee.relationship = employee.relationship;
      if (employee.SIPDisplay) resultEmployee.SIP = employee.SIP;
      if (employee.notesDisplay) resultEmployee.notes = employee.notes;
      let fields = [];
      if (employee.fields) {
        employee.fields.forEach(element => {
          if (element.display) fields.push(element);
        });
      }
      resultEmployee.fields = fields;
      return resultEmployee;
    } catch (error) {
      return "error " + error;
    }
  },
  getExcelStyle: () => {
    return {
      font: {
        color: '#000000',
        size: 12,
      }
    };
  },
  getExcelHeading: async (ws, style) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let columnCounter = 1;
          ws.cell(1, columnCounter++)
            .string("Id")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Civil Id")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Status')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Prefix")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("First")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Middle')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Last")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Suffix")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Phone')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Email")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Job Title")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Department')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Company")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Street")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('POBox')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Neighborhood")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("City")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('State')
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Zip Code")
            .style(style);
          ws.cell(1, columnCounter++)
            .string("Country")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('IM Account')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Website')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Event')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Relationship')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('SIP')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Notes')
            .style(style);
          ws.cell(1, columnCounter++)
            .string('Image')
            .style(style);
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  getExcelErrorsHeading: async (ws, style) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let columnCounter = 28;
          ws.cell(1, columnCounter++)
            .string("Error")
            .style(style);
          ws.cell(1, columnCounter++)
            .string('ErrorDetails')
            .style(style);
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  getExcelEmployee: (ws, style, employee, row) => {
    try {
      let columnCounter = 1;
      ws.cell(row, columnCounter++)
        .string(employee.id ? employee.id.toString() : "")
        .style(style);
      ws.cell(row, columnCounter++)
        .string(employee.civilId ? employee.civilId.toString() : "")
        .style(style);
      ws.cell(row, columnCounter++)
        .string(employee.status ? employee.status : "")
        .style(style);
      if (employee.name) {
        ws.cell(row, columnCounter++)
          .string(employee.name.prefix)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.name.first)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.name.middle)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.name.last)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.name.suffix)
          .style(style);
      }
      else columnCounter += 5
      ws.cell(row, columnCounter++)
        .string((convertPhoneToString(employee.phone)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertEmailToString(employee.email)).toString())
        .style(style);
      if (employee.organization) {
        ws.cell(row, columnCounter++)
          .string(employee.organization.jobTitle)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.organization.department)
          .style(style);
        ws.cell(row, columnCounter++)
          .string(employee.organization.company)
          .style(style);
      }
      else columnCounter += 3;
      let address = convertAddressToString(employee.address)
      address = address.result
      ws.cell(row, columnCounter++)
        .string(address.street)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.POBox)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.neighborhood)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.city)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.state)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.zipCode)
        .style(style);
      ws.cell(row, columnCounter++)
        .string(address.country)
        .style(style);

      ws.cell(row, columnCounter++)
        .string((convertPhoneToString(employee.IMAccount)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertArrayToString(employee.website)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertArrayToString(employee.event)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertEmailToString(employee.relationship)).toString())
        .style(style);
      ws.cell(row, columnCounter++)
        .string((convertArrayToString(employee.SIP)).toString())
        .style(style);
      if (employee.notes)
        ws.cell(row, columnCounter++)
          .string(employee.notes)
          .style(style);
      else columnCounter += 1;
      //const imagePath = './images/'+employee.image;
      if (employee.image && employee.image !== "")
        ws.cell(row, columnCounter++)
          .string(IMAGES_API_URL + employee.image)
          .style(style);
      // if (fs.existsSync(imagePath)) {
      //   const image = fs.readFileSync(imagePath, { encoding: 'base64', flag: 'r' })
      //   ws.cell(row, columnCounter++)
      //     .string(image)
      //     .style(style);
      // }
    } catch (error) {
      return error;
    }
  },
  getExcelError: async (ws, style, error, row) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          error = error.array_error;
          let columnCounter = 28;
          ws.cell(row, columnCounter++)
            .string(!error ? "" : error.reduce((accumulator, currentValue) => ({ location_type: accumulator.location_type + ' ,' + currentValue.location_type })).location_type)
            .style(style);
          ws.cell(row, columnCounter++)
            .string(!error ? "" : error.reduce((accumulator, currentValue) => ({ message: accumulator.message + ' ,' + currentValue.message })).message)
            .style(style);
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  convertExcelToEmployee: (item, connection) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const Employee = getEmployeeModel(connection)
          if (item.length === 0)
            reject(createError.BadRequest({
              array_error: [
                new ErrorResponse(
                  "createEmployee",
                  "Employee",
                  "row is empty"
                ),
              ],
              code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
            }));
          const countryCode = await CountryCodeService.get();
          let employee = new Employee()
          let counter = 0;
          let id = Number(item[counter++])
          let civilId = Number(item[counter++])
          employee.id = id;
          employee.civilId = civilId;
          employee.status = item[counter++]
          if (item[4] !== undefined && item[6] !== undefined)
            employee.name = {
              prefix: item[counter++],
              first: item[counter++],
              middle: item[counter++],
              last: item[counter++],
              suffix: item[counter++]
            }
          else counter += 5
          if (item[counter++]) {
            let phones = (item[counter - 1] + "")?.split(";")
            phones = phones?.map(phone => phone.split(","))
            phones = phones?.map((phone) => ({ info: phone[1], type: phone[2] !== "" ? phone[2] : "Home", code: phone[0] !== "" ? "+" + phone[0] : countryCode }))
            employee.phone = phones;
          }
          if (item[counter++]) {
            let emails = item[counter - 1]?.split(";")
            emails = emails?.map(email => email.split(","))
            emails = emails?.map(email => ({ info: email[0], type: email[1] && email[1] !== "" ? email[1] : "Home" }))
            employee.email = emails;
          }

          let organization = {}
          if (item[counter++])
            organization.jobTitle = item[counter - 1]
          if (item[counter++])
            organization.department = item[counter - 1]
          if (item[counter++])
            organization.company = item[counter - 1]
          let street = item[counter++]?.split(";")
          let POBox = item[counter++]?.split(";")
          let neighborhood = item[counter++]?.split(";")
          let city = item[counter++]?.split(";")
          let state = item[counter++]?.split(";")
          let zipCode = item[counter++]?.split(";")
          let country = item[counter++]?.split(";")
          let address = []
          street?.map((adr, index) => { address.push({ street: street[index], POBox: POBox[index], neighborhood: neighborhood[index], city: city[index], state: state[index], zipCode: zipCode[index], country: country[index], type: "Home" }) })
          employee.address = address;

          if (item[counter++]) {
            let IMAccount = item[20]?.split(";")
            IMAccount = IMAccount?.map(account => account.split(","))
            IMAccount = IMAccount?.map(account => ({ info: account[1], type: account[2] !== "" ? account[2] : "WhatsApp", code: account[0] !== "" ? "+" + account[0] : countryCode }))
            employee.IMAccount = IMAccount;
          }
          if (item[counter++]) {
            let websites = item[21]?.split(";")
            websites = websites?.map(website => ({ info: website }))
            employee.website = websites;
          }
          if (item[counter++]) {
            let events = item[counter - 1]?.split(";")
            events = events?.map(event => event.split(","))
            events = events?.map(event => ({ info: event[0], type: event[1] && event[1] !== "" ? event[1] : "Birthday" }))
            employee.event = events;
          }
          if (item[counter++]) {
            let relationships = item[counter - 1]?.split(";")
            relationships = relationships?.map(relationship => relationship.split(","))
            relationships = relationships?.map(relationship => ({ info: relationship[0], type: relationship[1] && relationship[1] !== "" ? relationship[1] : "Parent" }))
            employee.relationship = relationships;
          }
          if (item[counter++]) {
            let SIP = item[counter - 1]?.split(";")
            SIP = SIP?.map(s => ({ info: s }))
            employee.SIP = SIP;
          }
          if (Object.keys(organization).length !== 0)
            employee.organization = organization;
          let notes = item[counter++]
          employee.notes = notes;
          let image = item[counter++];
          if (image) {
            // const buf = Buffer.from(image, 'base64')
            // const imageName = Date.now()+Math.random() * 1000+".png"
            // const imagePath = './images/'+imageName;
            // fs.writeFile(imagePath, buf, function (err) {
            //   if (err) throw err;
            // });
            employee.image = image.replace(IMAGES_API_URL, "");
          }
          resolve(employee)
        } catch (error) {
          reject(createError.BadRequest({
            array_error: [
              new ErrorResponse(
                "createEmployee",
                "Employee",
                error.toString()
              ),
            ],
            code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
          }));
        }
      })()
    })
  }
};
*/
/*convertVCardToEmployee: (VCard) => {
    try {
      let employee = new Employee()
      employee.name = {
        prefix: VCard.n[0].value[3],
        first: VCard.n[0].value[1],
        middle: VCard.n[0].value[2],
        last: VCard.n[0].value[0],
        suffix: VCard.n[0].value[4]
      }
      let emails = []
      if (VCard.email)
        VCard.email.map(email => { emails.push({ info: email.value, type: Object.keys(email.meta)[1] }) })
      employee.email = emails;
      let phones = []
      if (VCard.tel)
        VCard.tel.map(phone => { phones.push({ info: phone.value, type: Object.keys(phone.meta)[0] }) })
      employee.phone = phones;
      let address = []
      if (VCard.adr)
        VCard.adr.map(adr => { address.push({ street: adr.value[2], POBox: adr.value[0], neighborhood: adr.value[1], city: adr.value[3], state: adr.value[4], zipCode: adr.value[5], country: adr.value[6], type: Object.keys(adr.meta)[0] }) })
      employee.address = address;
      let websites = []
      if (VCard.url)
        VCard.url.map(website => { websites.push({ info: website.value }) })
      employee.website = websites;
      let events = []
      if (VCard.bday)
        VCard.bday.map(event => { events.push({ info: event.value, type: "Birthday" }) })
      employee.event = events;
      let organization = {}
      if (VCard.org) organization = { department: VCard.org[0].value[1], company: VCard.org[0].value[0] }
      if (VCard.title) organization = { ...organization, jobTitle: VCard.title[0].value }
      employee.organization = organization;
      let notes = []
      let id = ""
      let civilId = ""
      if (VCard.note) {
        notes = VCard.note[0].value.split("\n");
        notes.map(row => {
          if (id === "" && row.match("^Id: .*"))
            id = row.match('\\d+') ? row.match('\\d+')[0] : ""
          if (civilId === "" && row.match("^Civil Id: .*"))
            civilId = row.match('\\d+') ? row.match('\\d+')[0] : ""
        })
        employee.id = id === "" ? "" : Number(id)
        employee.civilId = id === "" ? "" : Number(civilId)
        if (employee.id === "" || employee.civilId === "")
          employee.status = "Inactive"
        //employee.notes = notes[notes.length-1];
        notes[0].split("").splice(4,).map(item => id += item)
        notes[1].split("").splice(10,).map(item => civilId += item)
        if (notes.length === 3) {
        }
      }
      let image = "";
      if (VCard.photo) image = VCard.photo[0].value
      const buf = Buffer.from(image, 'base64')
      const imageName = Date.now() + Math.random() * 1000 + ".png"
      const imagePath = './images/' + imageName;
      fs.writeFile(imagePath, buf, function (err) {
        if (err) throw err;
      });
      employee.image = imageName;
      return employee
    } catch (error) {
      return ("error" + error)
    }
  },*/
