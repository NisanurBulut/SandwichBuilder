import React, { Component } from 'react';
import { connect } from 'react-redux';
import GeneralModal from '../../components/UI/GeneralModal/GeneralModal';
import Sandwich from '../../components/Sandwich/Sandwich';
import BuildControls from '../../components/BuildControls/BuildControls';
import classes from './SandwichBuilder.module.css';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import axios from '../../services/general-service';
import Spinner from '../../components/UI/Spinner/Spinner';
import WithErrorHandler from '../../hoc/WithErrorHandler/WithErrorHandler';
import * as actionTypes from '../../store/actions/index';
import imagePath from '../../assests/images/san2_.png';
class SandwichBuilder extends Component {
  state = {
    purchasing: false,
  };
  componentDidMount() {
    this.props.onInitIngredients();
  }
  purchaseHandler = () => {
    if(this.props.isAuthenticated){
      this.setState({ purchasing: true });
    }else{
      this.props.history.push('/auth')
    }
  };
  updatePurchaseState(ingredients) {
    const sum = Object.keys(ingredients)
      .map((igKey) => {
        return ingredients[igKey];
      })
      .reduce((sum, el) => {
        return sum + el;
      }, 0);
    return sum > 0;
  }
  purchaseCancelHandler = () => {
    this.setState({ purchasing: false });
  };
  purchaseContinueHandler = () => {
    this.props.history.push('/checkout');
  };
  render() {
    const disabledInfo = {
      ...this.props.ings,
    };
    for (let key in disabledInfo) {
      disabledInfo[key] = disabledInfo[key] <= 0;
    }
    let orderSummaryElement = null;
    let sandwichElement = this.props.error ? (
      <p>Ingredients doesnt load</p>
    ) : (
      <Spinner />
    );

    if (this.props.ings) {
      sandwichElement = (
        <Auxiliary>
           <Sandwich className={classes.row}
                ingredients={this.props.ings}
              />
                   <BuildControls
                ingredientAdded={this.props.onIngredientAdded}
                ingredientRemoved={this.props.onIngredientRemoved}
                disabled={disabledInfo}
                price={this.props.price}
                purchasable={this.updatePurchaseState(this.props.ings)}
                ordered={this.purchaseHandler}
                isAuth={this.props.isAuthenticated}
              />

        </Auxiliary>
      );
      orderSummaryElement = (
        <OrderSummary
          price={this.props.price}
          ingredients={this.props.ings}
          purchaseCancelled={this.purchaseCancelHandler}
          purchaseContinued={this.purchaseContinueHandler}
        />
      );
    }

    return (
      <Auxiliary>
        <GeneralModal
          show={this.state.purchasing}
          modalClosed={this.purchaseCancelHandler}
        >
          {orderSummaryElement}
        </GeneralModal>
        {sandwichElement}
      </Auxiliary>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ings: state.sandwichBuilder.ingredients,
    price: state.sandwichBuilder.totalPrice,
    error: state.sandwichBuilder.error,
    isAuthenticated: state.auth.token !== null,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    onIngredientAdded: (ingName) =>
      dispatch(actionTypes.addIngredient(ingName)),
    onIngredientRemoved: (ingName) =>
      dispatch(actionTypes.removeIngredient(ingName)),
    onInitIngredients: () => dispatch(actionTypes.initIngredients()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithErrorHandler(SandwichBuilder, axios));
