const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const request = require("request");
const WPAPI = require("wpapi");

const wpUrl = "https://wv4.ba0.myftpupload.com";
const ajaxUrl = `${wpUrl}/wp-admin/admin-ajax.php`;
const admUser = "admminhacase";
const admPwd = "CodornA#1604";
const mercadoPagoAccessToken =
  "TEST-1781202667816793-060914-a00a5202fa3fbe7c6aa153cec464f23e-1125422651";
  // "APP_USR-1781202667816793-060914-e165c691d475afc1529ce43af9179fbd-1125422651";

const app = express();

app.use(express.json());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "assets")));

app.all("*", (req, res, next) => {
  if (req.headers && req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, PATCH, POST, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);

  if (req.method.toUpperCase() === "OPTIONS") {
    res.status(200).send();
    return;
  }
  next();
});

app.post("/contact-us", async (req, res) => {
  const formId = "173";
  try {
    const nonce = await new Promise((res, rej) => {
      request.post(
        ajaxUrl,
        {
          body: "action=forminator_get_nonce",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
        (err, response) => {
          if (err) rej(err);
          res(JSON.parse(response.body));
        }
      );
    });

    req.body["forminator_nonce"] = nonce.data;
    req.body["form_id"] = formId;
    req.body["action"] = "forminator_submit_form_custom-forms";

    const response = await new Promise((res, rej) => {
      request.post(
        ajaxUrl,
        {
          body: Object.keys(req.body)
            .map((x) => x + "=" + req.body[x])
            .join("&"),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
        (err, response) => {
          if (err) rej(err);
          res(JSON.parse(response.body));
        }
      );
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post("/sign-up", async (req, res) => {

  const { body } = req;
  const user = {
    'name-1': `${body.firstname} ${body.lastname}`.trim(),
    'text-1': body.email,
    'email-1': body.email,
    'password-1': body.pwd,
  };

  const formId = "17";
  try {
    const nonce = await new Promise((res, rej) => {
      request.post(
        ajaxUrl,
        {
          body: "action=forminator_get_nonce",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
        (err, response) => {
          if (err) rej(err);
          res(JSON.parse(response.body));
        }
      );
    });

    user["forminator_nonce"] = nonce.data;
    user["form_id"] = formId;
    user["action"] = "forminator_submit_form_custom-forms";

    const response = await new Promise((res, rej) => {
      request.post(
        ajaxUrl,
        {
          body: Object.keys(user)
            .map((x) => x + "=" + user[x])
            .join("&"),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
        (err, response) => {
          if (err) rej(err);
          res(JSON.parse(response.body));
        }
      );
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error });
  }
  /*
  
  try {
    const { body } = req;
    const WPAPI = require("wpapi");

    const wp = new WPAPI({
      endpoint: `${wpUrl}/wp-json`,
      username: admUser,
      password: admPwd,
      auth: true
    });

    const users = await wp.users().create({
      email: body.email,
      username: body.email,
      password: body.pwd,
      first_name: body.firstname,
      last_name: body.lastname,
      roles: ["author"],
    });

    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error });
  }
  */
});

app.post("/sign-in", async (req, res) => {
  try {
    const { body } = req;

    const reqBody = { username: body.email, password: body.pwd };
    const authResponse = await new Promise((res, rej) => {
      request.post(
        `${wpUrl}/wp-json/jwt-auth/v1/token`,
        {
          json: true,
          body: reqBody,
        },
        (err, response) => {
          if (err) rej(err);
          res(response.body);
        }
      );
    });
    res.status(200).send(authResponse);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post("/payment", async (req, res) => {
  try {
    const { body } = req;
    var mercadopago = require("mercadopago");
    mercadopago.configurations.setAccessToken(mercadoPagoAccessToken);

    var data = await mercadopago.payment.create(body);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

app.get("/address", async (req, res) => {
  try {
    const { body } = req;

    const authResponse = await new Promise((res, rej) => {
      request.get(
        `http://viacep.com.br/ws/${req.query["zip"]}/json/`,
        (err, response) => {
          if (err) rej(err);
          res(JSON.parse(response.body));
        }
      );
    });
    res.status(200).json(authResponse);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Running on port ${process.env.PORT || 4000}`);
});

