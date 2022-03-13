import Cors from 'cors'
import initMiddleware from '../../../../../lib/init-middleware'
import withDatabase from '../../../../../lib/database-middleware'
import syncEvent from '../../../../../lib/sync-event'
import { NextApiRequest, NextApiResponse } from 'next'

const cors = initMiddleware(
  Cors({
    methods: ['GET', 'OPTIONS'],
  })
)

const handler = async (req, res: NextApiResponse) => {
  const { query: {gameid, chainid, address }, method } = req
  const addressLower = address.toLowerCase()
  await cors(req, res)

  switch (method) {
    case 'GET':
      try {
        const resData = await req.db.find({wallet_address: addressLower}).toArray()
        if (!Array.isArray(resData)) {
          throw new Error('Cannot find user data')
        }
        syncEvent(req.db)
        res.status(200).json(resData)
      } catch (err: any) {
        res.status(500).json({ statusCode: 500, message: err.message })
      }
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withDatabase(handler, "game-event-listener");
