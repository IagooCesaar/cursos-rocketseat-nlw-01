import path from 'path'
import express from "express";
import cors from 'cors'
import { errors } from 'celebrate'

import routes from './routes'

const app = express();

app.use(cors())
app.use(express.json());
app.use(routes)

app.use('/uploads', express.static(
  path.resolve(__dirname, '..','uploads')
))

app.use('/', (req, res, next) => {
  res.json({message: 'API is working! Try get from any route'})
  next();
})

app.use(errors())

app.listen(3333);
