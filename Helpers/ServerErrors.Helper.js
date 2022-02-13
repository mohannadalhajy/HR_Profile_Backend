const SERVER_ERRORS = {
  //---------------------------------------------
  //Authentication Errors Start from 1000 t0 1999
  //---------------------------------------------
  USER_IS_ALREADY_EXIST: 1000,

  USER_NOT_REGISTERED: 1001,

  USER_IS_NOT_VERIFY: 1002,

  NOT_GENERATE_CODE: 1003,

  INVALID_CODE: 1004,

  OTP_IS_EXPIRED: 1005,

  INVALID_PASSWORD: 1006,

  ACCESS_TOKEN_IS_NOT_FOUND: 1007,

  ACCESS_TOKEN_INVALID: 1008, // invalid or expired

  ACCESS_TOKEN_IS_NOT_GENERATED: 1009,

  ERROR_IN_HASH_PASSWORD: 1010,

  ERROR_IN_COMPARE_PASSWORD: 1011,

  PASSWORD_AND_CONFIRM_PASSWORD_NOT_CORRECT: 1012,

  DO_NOT_SEND_MESSAGE: 1013,

  OLD_PASSWORD_IS_NOT_CORRECT: 1014,

  ROLE_NOT_FOUND: 1015,

  //---------------------------------------------
  // Users Errors Start from 2000 t0 2999
  //---------------------------------------------
  USER_IS_DELETED: 2000,

  //---------------------------------------------
  // EMPLOYEE Errors Start from 3000 t0 3999
  //---------------------------------------------
  EMPLOYEE_NOT_FOUND: 3000,
  EMPLOYEE_INACTIVE: 3001,
  EMPLOYEE_ID_EXIST: 3005,
  EMPLOYEE_CIVIL_ID_EXIST: 3006,
  EMPLOYEE_EMPTY: 3007,
  EMPLOYEE_NAME_EMPTY: 3008,
  EMPLOYEE_PHONE_EMPTY: 3009,
  EMPLOYEE_EMAIL_EMPTY: 3010,
  EMPLOYEE_IM_ACCOUNT_EMPTY: 3011,
  EMPLOYEE_EVENT_EMPTY: 3012,
  EMPLOYEE_PHONE_NOT_VALID: 3013,
  EMPLOYEE_IM_ACCOUNT_NOT_VALID: 3014,
  EMPLOYEE_EMAIL_NOT_VALID: 3015,
  EMPLOYEE_EVENT_NOT_VALID: 3016,
  RESPONSE_EXIST:3020,
  //---------------------------------------------
  // EMPLOYEE Errors Start from 4000 t0 4999
  //---------------------------------------------
  PUBLIC_DISPLAY_EXIST: 4000,
  //---------------------------------------------
  // Invalid Id (Mongodb id)
  INVALID_ID: 11000,

  //---------------------------------------------
  //Link does not found
  LINK_NOT_FOUND: 12000,
};

module.exports = SERVER_ERRORS;
