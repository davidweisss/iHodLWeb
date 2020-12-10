import QRCode from 'qrcode.react'
import React, {useState} from 'react'
import ReactDOM from 'react-dom';
import { Form, Input, Menu, Segment, Header} from 'semantic-ui-react'

let BitAuth = (props) => {

  const [active, setActive] = useState('sign')

  return (
    <Segment secondary>
      <Menu attached='top' tabular>
	<Menu.Item
	  name='Sign'
	  active={active === 'sign'}
	  onClick={() => setActive('sign')}
	/>
	<Menu.Item
	  name='Pay'
	  active={active === 'pay'}
	  onClick={() => setActive('pay')}
	/>
      </Menu>
      {active === 'sign' &&
      <Form.Field as="h2">
	<label>Signature (sign this message: "challenge")</label>
	<textarea rows='10' cols='60' required name="signedMessage" />
      </Form.Field>
      }
      {active === 'pay' &&
	<div>
	  <Header as='h1' style={{margin: '5px'}}>
	   Pay any amount from this campaign's address 
	    <Header as='h3' style={{margin: '5px'}}>Wait a few moments after paying, then confirm by clicking below </Header>
	  </Header>
	  <QRCode style={{margin: '10px 10px 10px 20px'}} value={props.pay2AuthAddress} size="200"/>
	  <br/>
	  Pay to: {props.pay2AuthAddress}
	  </div>
     }
    </Segment>
  )
}

export default BitAuth
