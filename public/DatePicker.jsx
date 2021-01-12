import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
import { Checkbox, Menu, Step, Form, Button, Container, Message, Image, Header, Icon, Segment, TextArea } from 'semantic-ui-react'

import DatePicker from "react-datepicker";

import "./react-datepicker.css";

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';

import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';
const address = '1KfuAQ5UiX2tUHy6Fz6ScoKZ9zH2DytBwP'
const signedMessage = 'HxuTynncFA7+xw31VG88H/St/3kOKHJDr83076baseguMFg90cCxZhlXXc83zyDf/B5f2BWhfrnWR5pmwnreqGw='
const link = createHttpLink({ uri: "http://localhost/graphql",
  headers: { 'Content-Type':'application/graphql'},
});
const client = new ApolloClient({
  link:link
});

const DETAILS_CAMPAIGN = gql`
query {getCampaign(id:"${address}"){
  startDate
  endDate
}}
`

let PickDate = (gqlQuery) => {

  const [openEnded, setOpenEnded] = useState('false');
  const [startDate, setStartDate] = useState(Date.now());
  const [endDate, setEndDate] = useState((new Date( Date.now() + (6.048e+8 ) )).getTime());
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);

  useEffect(() => {
    if (!loading && !error && data){
      setStartDate(parseInt(data.getCampaign.startDate))
      setEndDate(parseInt(data.getCampaign.endDate));
    }}
    , [loading, error, data])

  if (loading) return (
    <Container>
      <br/> <br/>
      <h2> Checking campaign status...</h2>
    </Container>
  )
  if (error){
    return <p>ERROR: {error.message}</p>
  }

  let endDateInit = new Date(parseInt(data.getCampaign.endDate))
  let startDateInit = new Date(parseInt(data.getCampaign.startDate))

  let DatesInit = `${startDateInit.getDate()}/${startDateInit.getMonth()+1}/${startDateInit.getYear()+1900}--${endDateInit.getDate()}/${endDateInit.getMonth()+1}/${endDateInit.getYear()+1900}`


  return(
    <>
      <Form id="details" action='UpdateMediaDetails'>
	<Form.Field as="h2">
	  <label>Dates (set to: {DatesInit})</label>

	  { !openEnded &&
	  <DatePicker 
	    selected={startDate} 
	    onChange={date => setStartDate(date)} 
	  />
	  }
	  {openEnded &&
	    <>
	      <DatePicker
		selected={startDate}
		onChange={date => setStartDate(date)}
		selectsStart
		startDate={startDate}
		endDate={endDate}
	      />
	      <DatePicker
		selected={endDate}
		onChange={date => setEndDate(date)}
		selectsEnd
		startDate={startDate}
		endDate={endDate}
		minDate={startDate}
	      />
	    </>
	  }
	  <br/>
	  <Checkbox toggle onChange={()=>setOpenEnded(!openEnded)} label='Open Ended'/>
	  <input type="hidden" name="endDate" value={endDate}/>
	  <input type="hidden" name="startDate" value={startDate}/>
	</Form.Field>
	<Form.Field>
	  <input type="hidden" name="address" value={address}/>
	  <input type="hidden" name="signedMessage" value={signedMessage}/>
	</Form.Field>
	<Button primary size="massive" type='submit'>
	  <i class="save icon"></i>
	  Save</Button>
      </Form>
      <Header as="h3" style={{color:"Gray"}}>
	<a href={'https://bitfundme.rocks/Campaign?address='+address} >
	  Campaign address: <Icon fitted name="bitcoin"/>{address}
	</a>
      </Header>
    </>

  )
}

const el = 
  <ApolloProvider client={client}>
    <PickDate gqlQuery={DETAILS_CAMPAIGN}/>
  </ApolloProvider>
  ReactDOM.render(
    el, document.getElementById('DatePicker')
  );	
