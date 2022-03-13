// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

export type Event = {
  event_id: number
  start_time: string
  end_time: string
  event_name: string
  rank_num: number
  wallet_address?: string
  cid?: string
}