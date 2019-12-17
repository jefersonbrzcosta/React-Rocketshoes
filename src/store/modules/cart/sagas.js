import { call, select, put, all, takeLatest } from "redux-saga/effects";
import { formatPrice } from "../../../ultil/format";
import { toast } from "react-toastify";
import history from "../../../services/history";

import api from "../../../services/api";
import { addtoCartSucess, updateAmountSuccess } from "./actions";

function* addtoCart({ id }) {
  const productExists = yield select(state =>
    state.cart.find(p => p.id === id)
  );

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    toast.error("Quantidade solicitada fora de estoque.");
    return;
  }

  if (productExists) {
    yield put(updateAmountSuccess(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price)
    };

    yield put(addtoCartSucess(data));
    history.push("/cart");
  }
}

function* updateAmount({ id, amount }) {
  if (amount <= 0) return;

  const stock = yield call(api.get, `stock/${id}`);
  const stockAmount = stock.data.amount;

  if (amount > stockAmount) {
    toast.error("Quantidade solicitava fora de estoque");
    return;
  }

  yield put(updateAmountSuccess(id, amount));
}

export default all([
  takeLatest("@cart/ADD_REQUEST", addtoCart),
  takeLatest("@cart/UPDATE_AMOUNT_REQUEST", updateAmount)
]);