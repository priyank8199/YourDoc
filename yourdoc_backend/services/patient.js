const db = require('./db');
const helper = require('../helper');
const config = require('../dbconfig');
const { v4: uuid } = require('uuid');

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT name, blood_group
      FROM user u, patient p
      WHERE p.user_id = u.id
      LIMIT ${offset},${config.listPerPage}
    `
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta
  }
}

async function create(patient) {
  const { blood_group, email, password, name, type, phone, dob, gender, address, latlong, avatar_url } = patient;
  const id = uuid();

  const result = await db.query(
    `INSERT INTO user
      (id, email, password, name, type, phone, dob, gender, address, latlong, avatar_url)
    VALUES
      (${id}, ${email}, ${password}, ${name}, ${type}, ${phone}, ${dob}, ${gender}, ${address}, ${latlong}, ${avatar_url});
    INSERT INTO patient
      (id, blood_group)
    VALUES
      (${id}, ${blood_group});
    `
  );

  let message = 'Error in creating appointment';

  if (result.affectedRows) {
    message = 'Appointment created successfully';
  }

  return { message, id };
}

module.exports = {
  getMultiple,
  create
}