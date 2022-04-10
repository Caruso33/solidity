module.exports = {
  createAirlines,
  voteForAirlines,
  registerOracles,
  advanceTime,
  advanceBlock,
  takeSnapshot,
  revertToSnapshot,
  advanceTimeAndBlock,
}

// https://github.com/ejwessel/GanacheTimeTraveler

function createAirlines(config, airlines) {
  const promises = []

  airlines.forEach(async (airline) => {
    promises.push(
      config.flightSuretyData.createAirline(airline.name, airline.address, {
        from: config.owner,
      })
    )
  })

  return Promise.all(promises)
}

async function voteForAirlines(config, airlines) {
  const initialAirlineFunding =
    await config.flightSuretyData.getInitialFunding()

  const promises = []
  airlines.slice(0, 3).forEach(async (airline) => {
    promises.push(
      config.flightSuretyData.provideAirlinefunding(airline.address, {
        value: initialAirlineFunding,
        from: airline.address,
      })
    )
  })

  return Promise.all(promises)
}

async function registerOracles(config, accounts, oracleCount = 3) {
  const registration_fee = await config.flightSuretyApp.REGISTRATION_FEE.call()

  const promises = []
  for (let i = 1; i <= oracleCount; i++) {
    promises.push(
      config.flightSuretyApp.registerOracle({
        from: accounts[i],
        value: registration_fee,
      })
    )
  }

  return Promise.all(promises).then(async () => {
    for (let i = 1; i <= oracleCount; i++) {
      const result = await config.flightSuretyApp.getMyIndexes.call({
        from: accounts[i],
      })

      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`)
    }
  })
}

function advanceTime(time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [time],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      }
    )
  })
}

function advanceBlock() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        const newBlockHash = web3.eth.getBlock("latest").hash

        return resolve(newBlockHash)
      }
    )
  })
}

function takeSnapshot() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_snapshot",
        id: new Date().getTime(),
      },
      (err, snapshotId) => {
        if (err) {
          return reject(err)
        }
        return resolve(snapshotId)
      }
    )
  })
}

function revertToSnapshot(id) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_revert",
        params: [id],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      }
    )
  })
}

async function advanceTimeAndBlock(time) {
  await advanceTime(time)
  await advanceBlock()
  return Promise.resolve(web3.eth.getBlock("latest"))
}
