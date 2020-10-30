import styled from 'styled-components'
import {WithResponsive} from './WithResponsive.jsx'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
} from 'semantic-ui-react'

let breakpoint = 450

const HomepageHeading=styled(Header)`
       	background-color: #aad0df;
`;

const BitfundmeHeader=styled(Header)`
	      color: orange;
	      display: inline-block;
	      font-weight: normal;
	      margin-bottom: 0;
	      font-style: italic;
	      font-size: 25px; 
	      padding: 5px 5px 5px 5px; 
`;
// ${props => ((props.width/100 > 5) ? '5rem' : props.width/100+'rem')};
const CatchphraseHeader=styled(Header)`
	      font-size: ${props => ((props.width/150 > 2) ? '2rem' : props.width/150+'rem')};
	    font-weight: normal;
	    font-family: monospace;
	    margin-top: 3rem;
	    margin-bottom: 2rem;
	    color: white;
`;

class HomepageLayout extends React.Component {
  render(){
    let width = this.state.width
    let desktop = window.innerWidth > breakpoint
    return (
      <div>
	<HomepageHeading>
	  <Container  style={{textAlign:'center', paddingTop: '50px', paddingBottom: '120px'}}>
	    <BitfundmeHeader
	      width={width}
	      as='h1'
	      inverted
	    >
	      <img style={{float: 'left', display: 'inline-block', paddingRight:'8px', height: '40px'}} src='bfmLogo.png'/>
	      <div style={{color: 'white', float: 'left', margin: 'auto', height: '36px', display: 'inline-block'}}>
		BitFundMe
	      </div>
	    </BitfundmeHeader>
	    <CatchphraseHeader
	      width={width}
	      as='h2'>
	      Bitcoin Crowdfunding
	    </CatchphraseHeader>

	    <div style={{flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', display: 'flex'}}>
	      <Button href='newAddress' primary size='large' style={{backgroundColor:'white', color:'maroon', margin:'15px 15px 15px 15px'}}>
		Create
		<Icon name='right arrow' />
	      </Button>
	      <Button href='Search' primary size='large' style={{backgroundColor:'white', color:'maroon', margin:'15px 15px 15px 15px' }}>
		Search
		<Icon style={{margin:'0 0 0 7px'}} name='search' />
	      </Button>
	    </div>
	  </Container>
	</HomepageHeading>

	<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', display: 'flex', margin:'-65px 0 0 30px'}}>
	<div style={{maxWidth: '300px', margin:'0 35px 35px 0'}}>
	  <Image as='a' href='Campaign2?address=33xg3KwRCHvnvNNyhg6b3qZijQgmo6knEj' style={{transform: 'rotate(-2deg)'}} size='large' src='product.png' />
	</div>
	  <div style={{maxWidth: '300px', margin:'35px 35px 0 35px'}}>
	  <p style={{ fontSize: '1.33em' }}>
	    Entirely new type of app: remain anonymous AND in control of your info, money
	  </p>
	  <p style={{ fontSize: '1.33em' }}>
	    Works with a bitcoin wallet instead of a username and password
	  </p>
	  <p style={{ fontSize: '1.33em' }}>
	    Be part of a growing directory of crowdfunding campaigns
	  </p>
	</div>
      </div>
	<div style={{textAlign:'center', margin: '50px 0 60px 0'}} > 
	  <Button href='https://bitfundme.rocks:3000/tutorials/2020/09/03/Getting-started.html' primary style={{color: 'white', background: 'orange'}} size='huge'>Learn How</Button>
	</div>
      <Segment inverted vertical style={{ backgroundColor: '#aad0df', padding: '5em 0em' }}>
	<Container>
	  <Grid divided inverted stackable>
	    <Grid.Row>
	      <Grid.Column width={3}>
		<Header inverted as='h4' content='About' />
		<List link inverted>
		  <List.Item style={{color: 'white'}} href="https://twitter.com/davidweisss" target='_blank' as='a'>Contact</List.Item>
		</List>
	      </Grid.Column>
	    </Grid.Row>
	  </Grid>
	</Container>
      </Segment>
      </div>
    )
  }
}

let ResponsiveHomepageLayout = WithResponsive(HomepageLayout)
ReactDOM.render(
  <ResponsiveHomepageLayout/>, document.getElementById('home')
);	
