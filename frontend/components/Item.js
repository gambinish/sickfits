import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Title from './styles/Title';
import ItemStyles from './styles/ItemStyles';
import PriceTag from './styles/ItemStyles';
import formatMoney from '../lib/formatMoney';
import DeleteItem from '../components/DeleteItem';

export default class Item extends Component {
  static propTypes = {
    // Look up PropTypes
    item: PropTypes.object.isRequired,
  }
  render() {
    const { item } = this.props
    return (
      <ItemStyles>
        {/* If there is an item image, this will return to true and run the img tag */}
        {item.image && <img src={item.image} alt={item.title} />}
        <Title>
          <Link href={{
            pathname: '/item',
            query: { id: item.id },
          }}>
            <a>{item.title}</a>
          </Link>
        </Title>
        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <p>{item.description}</p>

        <div className='buttonList'>
          <Link href={{
            pathname: 'update',
            query: { id: item.id }
          }}>
            <a>Edit</a>
          </Link>
          <a>Add To Cart</a>
          <DeleteItem id={item.id}>Delete This Item</DeleteItem>
        </div>

      </ItemStyles>
    );
  }
}

