import React, { useState,useEffect } from 'react';

import { Jutsu } from 'react-jutsu'

const CallJitsi = (props) => {
  const [room, setRoom] = useState(props.room_id)
  const [name, setName] = useState(props.cr_username)
  const [call, setCall] = useState(true)
  const [password, setPassword] = useState('')

  const handleClick = event => {
    event.preventDefault()
    if (room && name) setCall(true)
  }

  useEffect(()=>{
    //alert(props.cr_username);
    //setName(props.cr_username)
  },[])

  return call ? (
    <Jutsu
      roomName={room}
      displayName={name}
      password={password}
      // onMeetingEnd={() => console.log('Meeting has ended')}
      loadingComponent={<p>loading ...</p>}
      errorComponent={<p>Oops, something went wrong</p>} />
  ) : (
    <form>
      <input id='room' type='text' placeholder='Room' value={room} onChange={(e) => setRoom(e.target.value)} />
      <input id='name' type='text' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
      <input id='password' type='text' placeholder='Password (optional)' value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleClick} type='submit'>
        Start / Join
      </button>
    </form>
  )
}

export default CallJitsi
