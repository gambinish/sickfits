// this is a custom App wrapper. The data here will persist throughout the various pages in the app
// the 'Container' component imported from next will render out whatever other component the user is navigated to

import App, { Container } from 'next/app';
import Page from '../components/Page'

class MyApp extends App {
  render() {

    const { Component } = this.props;

    return (
      <Container>
        <Page>
          <Component />
        </Page>
      </Container>

    )
  }
}

export default MyApp;