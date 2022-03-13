import axios from 'axios'
import Web3 from 'web3';
const web3 = new Web3();

const covalentBaseUrl = "https://api.covalenthq.com"
const covalentDefaultParam = {
  "quote-currency": "USD",
  format: "JSON",
  key: process.env.COVALENT_API_KEY
}
const chainId = 80001

const getLatestBlock = async () => {
  const url = `${covalentBaseUrl}/v1/${chainId}/block_v2/latest/`
  const res = await axios.get(url, { headers: { Accept: "application/json" }, params: covalentDefaultParam })
  return res.data.data.items[0]
}

const getLighthouseEvents = async ({ startingBlock, endingBlock }) => {
  const ligthouseContractAddress = "0xEe24a604d86fC158798031c70C4Cf9EB291aDdad"
  const uploaderAddress = "0x7C075e57dB81f54411F708cB6578d41dbf1b9c8D"
  const url = `${covalentBaseUrl}/v1/${chainId}/events/address/${ligthouseContractAddress}/`
  const params = {
    ...covalentDefaultParam,
    "starting-block": startingBlock,
    "ending-block": endingBlock
  }
  const res = await axios.get(url, { headers: { Accept: "application/json" }, params: params })
  return res.data.data.items
    .map(raw => {
      const decoded = decodeLog(raw)
      return {
        ...raw,
        decoded: decoded
      }
    })
    .filter(event => event.decoded.uploader == uploaderAddress)
}

const decodeLog = (rawLog) => {
  const eventInput = [
    {
      indexed: true,
      internalType: "address",
      name: "uploader",
      type: "address",
    },
    {
      indexed: false,
      internalType: "string",
      name: "cid",
      type: "string",
    },
    {
      indexed: false,
      internalType: "string",
      name: "config",
      type: "string",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "fileCost",
      type: "uint256",
    },
    {
      indexed: false,
      internalType: "string",
      name: "fileName",
      type: "string",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "fileSize",
      type: "uint256",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "timestamp",
      type: "uint256",
    },
  ]
  const decoded = web3.eth.abi.decodeLog(eventInput, rawLog.raw_log_data, [rawLog.raw_log_topics[1]]);
  return decoded
}

const getContentByCid = async (cid) => {
  const url = `https://gateway.lighthouse.storage/ipfs/${cid}`
  const res = await axios.get(url)
  return res.data
}

const insertData = async (mongodb, eventLog) => {
  const jsonContent = await getContentByCid(eventLog.decoded.cid)
  const data = {
    ...jsonContent,
    cid: eventLog.decoded.cid,
    tx: eventLog.tx_hash,
    block_height: eventLog.block_height
  }
  console.log("inserting")
  console.log(data)
  mongodb.insertOne(data)
}

export default async function syncEvent(mongodb) {
  try {
    const maxHeightRecord = await mongodb.find().sort({block_height:-1}).limit(1).toArray()
    const latestBlock = await getLatestBlock()
    const startingBlock = maxHeightRecord.length > 0 ? maxHeightRecord[0].block_height : 25451865
    const endingBlock = latestBlock.height
    if (startingBlock < endingBlock) {
      const eventLogs = await getLighthouseEvents({ startingBlock, endingBlock })
      if (eventLogs.length > 0) {
        console.log(`insert ${eventLogs.length} data`)
        eventLogs.forEach(eventLog => {
          insertData(mongodb, eventLog)
        });
      }
    }
  } catch (err) {
    console.log(err)
  }
}