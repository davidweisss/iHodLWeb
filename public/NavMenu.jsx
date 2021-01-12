import React, {useState} from 'react'
import ReactDOM from 'react-dom';
import { Header, Image, Menu } from 'semantic-ui-react'

let NavMenu = (props) =>{
  let [active, setActive] = useState(props.active)

  return(
    <div class="ui rail">
      <div class="ui fixed top sticky">
	<Menu style={{marginTop:'10px'}} size='massive'>
	  <Menu.Item as='h1' as='a' href='/'>
	    <Image fluid size='mini' src='bfmLogo.png'/>	
	  </Menu.Item>
	  <Menu.Item style={{color: 'teal', fontWeight: 'bold'}} active={active==='search'} as='h1' as='a' href='/Search'>
	    Search Campaigns
	  </Menu.Item>
	  <Menu.Item style={{color: 'teal', fontWeight: 'bold'}} active={active==='new'} as='h1' as='a' href='/NewAddress'>
	    Create New Campaign
	  </Menu.Item>
	  <Menu.Item style={{color: 'teal', fontWeight: 'bold'}}  as='h1' as='a' href='https://bitfundme.rocks:3000/tutorials/2020/09/03/Getting-started.html'>
	    Tutorial
	  </Menu.Item>
	</Menu>
      </div>
    </div>
  )
}

export default NavMenu
