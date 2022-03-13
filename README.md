# akashic-recorder-listener

## install

```
$ yarn install
$ cp .env.local.example .env.local
```

## run

```
$ yarn dev
```

## get

```
$ export host=http://localhost:3000
$ export address=0xff93B45308FD417dF303D6515aB04D9e89a750Ca

$ curl -X GET ${host}/api/1/80001/${address}

[{"_id":"622c7b306cc3152dbf10ef41","event_id":"1","start_time":"2022-03-09T23:13:00Z","end_time":"2022-03-09T23:15:00Z","event_name":"Event 1","rank_num":"1","wallet_address":"0xff93B45308FD417dF303D6515aB04D9e89a750Ca","cid":"QmUeGkmHnJmJjyuuKuCAQxMRQPxtYVE7FiVFU4vN3d47c4","tx":"0x50fe073b089ec74c00e0290560ea58c3f9b0849624c010b4ddbae2469c165015"}]
```