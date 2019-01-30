import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import Error from './ErrorMessage';
import formatMoney from '../lib/formatMoney';

const CREATE_ITEM_MUTATION = gql`
mutation CREATE_ITEM_MUTATION(    
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
  createItem(
    title: $title
    description: $description
    price: $price
    image: $image
    largeImage: $largeImage
  ) {
    id
  }
}
`;


class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: 'img.jpg',
    largeImage: 'lrg.png',
    price: 0,
  }
  // this is an awesome helper function! can handle multiple inputs
  handleChange = (e) => {
    const { name, type, value } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val });
  }
  uploadFile = async (e) => {
    console.log('uploading file');
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    // cloudinary config
    data.append('upload_preset', 'sickfits');
    const res = await fetch('https://api.cloudinary.com/v1_1/dvkow3qam/image/upload', {
      method: 'POST',
      body: data
    });
    const file = await res.json();
    console.log('FILE:', file)
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    })
  }
  render() {
    return (
      // call mutation defined above, and wrap form in 'Mutation' tag. return form.
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          // implicitly return the form
          <Form onSubmit={async (e) => {
            // stop form from submitting
            e.preventDefault();
            // call the mutation
            const res = await createItem();
            // redirect to item detail page
            console.log('RESPONSE: ', res)
            Router.push({
              pathname: '/item',
              query: { id: res.data.createItem.id },
            })
          }}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                File
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an Image"
                  required
                  // value={this.state.image}
                  onChange={this.uploadFile}
                />
                {/* TODO: add loading bar and default whitespace */}
                {this.state.image && <img width={200} src={this.state.image} />}
              </label>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
                  onChange={this.handleChange} />
              </label>
              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={this.state.price}
                  onChange={this.handleChange} />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter Description"
                  required
                  value={this.state.description}
                  onChange={this.handleChange} />
              </label>
              <button type="submit">
                Submit
          </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION }