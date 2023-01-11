<template>
    <div @click="checkClick" ref="invoiceWrap" class="invoice-wrap flex flex-column">
        <form @submit.prevent="submitForm" class="invoice-content">
            <Loading v-show="loading" />
            <h1 v-if="!editInvoice">New Invoice</h1>
            <h1 v-else>Edit Invoice</h1>

            <!-- Client -->
            <div class="client flex flex-column">
                <h3>Client</h3>
                <div class="input flex flex-column">
                    <label for="clientName">Name</label>
                    <input required type="text" id="clientName" v-model="clientName" />
                </div>
                <div class="input flex flex-column">
                    <label for="clientEmail">Email</label>
                    <input required type="text" id="clientEmail" v-model="clientEmail" />
                </div>
                <div class="input flex flex-column">
                    <label for="clientStreetAddress">Street Address</label>
                    <input required type="text" id="clientStreetAddress" v-model="clientStreetAddress" />
                </div>
                <div class="location-details flex">
                    <div class="input flex flex-column">
                        <label for="clientCity">City</label>
                        <input required type="text" id="clientCity" v-model="clientCity" />
                    </div>
                    <div class="input flex flex-column">
                        <label for="clientZipCode">Zip Code</label>
                        <input required type="text" id="clientZipCode" v-model="clientZipCode" />
                    </div>
                    <div class="input flex flex-column">
                        <label for="clientCountry">Country</label>
                        <input required type="text" id="clientCountry" v-model="clientCountry" />
                    </div>
                </div>
            </div>

            <!-- Invoice Work Payment -->
            <div class="invoice-work flex flex-column">
                <h3>Payment</h3>
                <div class="payment flex">
                    <div class="input flex flex-column">
                        <label for="invoiceDate">Invoice Date</label>
                        <input disabled type="text" id="invoiceDate" v-model="invoiceDate" />
                    </div>
                    <div class="input flex flex-column">
                        <label for="paymentDueDate">Payment Due</label>
                        <input disabled type="text" id="paymentDueDate" v-model="paymentDueDate" />
                    </div>
                </div>
                <div class="input flex flex-column">
                    <label for="paymentTerms">Payment Terms</label>
                    <select type="text" id="paymentTerms" v-model="paymentTerms">
                        <option value="0">today</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                    </select>
                </div>
                <div class="work-items">
                    <h3>Item List</h3>
                    <table class="item-list">
                        <tr class="table-heading flex">
                            <th class="item-name">Item Name</th>
                            <th class="qty">Qty</th>
                            <th class="price">Price</th>
                            <th class="total">Total</th>
                        </tr>
                        <tr class="table-items flex" v-for="(item, index) in invoiceItemList" :key="index">
                            <td class="item-name">
                                <input type="text" v-model="item.itemName">
                            </td>
                            <td class="qty">
                                <input type="text" v-model="item.qty">
                            </td>
                            <td class="price">
                                <input type="text" v-model="item.price">
                            </td>
                            <td class="total flex">
                                ${{ (item.total = item.qty * item.price) }}
                            </td>
                            <img @click="deleteInvoiceItem(item.id)" src="@/assets/icon-delete.svg" alt="">
                        </tr>

                    </table>
                    <div @click="addNewInvoiceItem" class="flex button">
                        <img src="@/assets/icon-plus.svg" alt="">
                        Add New Item
                    </div>
                </div>
            </div>

            <!-- Buttons -->
            <div class="save flex">
                <div class="left">
                    <button type="button" @click="closeInvoice" class="red">Cancel</button>
                </div>
                <div class="right flex">
                    <button v-if="!editInvoice" type="submit" @click="saveDraft" class="dark-purple">
                        Save Draft
                    </button>
                    <button v-if="!editInvoice" type="submit" @click="publishInvoice" class="purple">
                        Create Invoice
                    </button>
                    <button v-if="editInvoice" type="submit" class="purple">
                        Update Invoice
                    </button>


                </div>

            </div>


        </form>

    </div>
</template>
<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import { uid } from 'uid';
import Loading from '../components/Loading.vue';
import db from '../firebase/firebaseInit.js';

export default {
    name: "invoiceModal",
    components: {
        Loading
    },
    data() {
        return {
            dateOptions: { year: "numeric", month: "short", day: "numeric" },
            docId: null,
            loading: null,
            clientName: null,
            clientEmail: null,
            clientStreetAddress: null,
            clientCity: null,
            clientZipCode: null,
            clientCountry: null,
            invoiceDateUnix: null,
            invoiceDate: null,
            paymentTerms: null,
            paymentDueDateUnix: null,
            paymentDueDate: null,
            invoicePending: null,
            invoiceDraft: null,
            invoiceItemList: [],
            invoiceTotal: 0,
        }
    },
    created() {

        if (!this.editInvoice) {
            this.invoiceDateUnix = Date.now();
            this.invoiceDate = new Date(this.invoiceDateUnix).toLocaleDateString('en-us', this.dateOptions);
        }

        if (this.editInvoice) {
            const currentInvoice = this.currentInvoiceArray[0];
            this.docId = currentInvoice.docId;
            this.clientName = currentInvoice.clientName;
            this.clientEmail = currentInvoice.clientEmail;
            this.clientStreetAddress = currentInvoice.clientStreetAddress;
            this.clientCity = currentInvoice.clientCity;
            this.clientZipCode = currentInvoice.clientZipCode;
            this.clientCountry = currentInvoice.clientCountry;
            this.invoiceDateUnix = currentInvoice.invoiceDateUnix;
            this.invoiceDate = currentInvoice.invoiceDate;
            this.paymentTerms = currentInvoice.paymentTerms;
            this.paymentDueDateUnix = currentInvoice.paymentDueDateUnix;
            this.paymentDueDate = currentInvoice.paymentDueDate;
            this.invoicePending = currentInvoice.invoicePending;
            this.invoiceDraft = currentInvoice.invoiceDraft;
            this.invoiceItemList = currentInvoice.invoiceItemList;
            this.invoiceTotal = currentInvoice.invoiceTotal;
        }

    },
    methods: {
        ...mapMutations(['TOGGLE_INVOICE', 'TOGGLE_MODAL', 'TOGGLE_EDIT_INVOICE']),
        ...mapActions(['UPDATE_INVOICE', 'GET_INVOICES']),

        checkClick(e) {
            if (e.target === this.$refs.invoiceWrap) {
                this.TOGGLE_MODAL();
            }
        },
        closeInvoice() {
            this.TOGGLE_INVOICE();
            if (this.editInvoice) {
                this.TOGGLE_EDIT_INVOICE();
            }
        },
        addNewInvoiceItem() {
            this.invoiceItemList.push({
                id: uid(),
                itemName: "",
                qty: "",
                price: 0,
                total: 0,
            })
        },
        deleteInvoiceItem(id) {
            this.invoiceItemList = this.invoiceItemList.filter((item) => item.id !== id);
        },
        calcInvoiceTotal() {
            this.invoiceTotal = 0;
            this.invoiceItemList.forEach(item => {
                this.invoiceTotal += item.total
            });
        },
        publishInvoice() {
            this.invoicePending = true;
        },
        saveDraft() {
            this.invoiceDraft = true;
        },
        async uploadInvoice() {
            if (this.invoiceItemList.length <= 0) {
                alert('Please, insure you filled out work items.');
                return;
            }

            this.loading = true;

            this.calcInvoiceTotal();

            const dataBase = db.collection('invoice').doc();

            await dataBase.set({
                invoiceId: uid(6),
                clientName: this.clientName,
                clientEmail: this.clientEmail,
                clientStreetAddress: this.clientStreetAddress,
                clientCity: this.clientCity,
                clientZipCode: this.clientZipCode,
                clientCountry: this.clientCountry,
                invoiceDateUnix: this.invoiceDateUnix,
                invoiceDate: this.invoiceDate,
                paymentTerms: this.paymentTerms,
                paymentDueDateUnix: this.paymentDueDateUnix,
                paymentDueDate: this.paymentDueDate,
                invoiceItemList: this.invoiceItemList,
                invoiceTotal: this.invoiceTotal,
                invoicePending: this.invoicePending,
                invoiceDraft: this.invoiceDraft,
                invoicePaid: null,
            });

            this.loading = false;

            this.TOGGLE_INVOICE();

            this.GET_INVOICES();

        },

        async updateInvoice() {
            if (this.invoiceItemList.length <= 0) {
                alert('Please, insure you filled out work items.');
                return;
            }

            this.loading = true;

            this.calcInvoiceTotal();

            const dataBase = db.collection('invoice').doc(this.docId);

            await dataBase.update({
                clientName: this.clientName,
                clientEmail: this.clientEmail,
                clientStreetAddress: this.clientStreetAddress,
                clientCity: this.clientCity,
                clientZipCode: this.clientZipCode,
                clientCountry: this.clientCountry,
                invoiceDateUnix: this.invoiceDateUnix,
                invoiceDate: this.invoiceDate,
                paymentTerms: this.paymentTerms,
                paymentDueDateUnix: this.paymentDueDateUnix,
                paymentDueDate: this.paymentDueDate,
                invoiceItemList: this.invoiceItemList,
                invoiceTotal: this.invoiceTotal,
            });

            this.loading = false;
            const data = {
                docId: this.docId,
                routeId: this.$route.params.invoiceId,
            }

            this.UPDATE_INVOICE(data);

        },
        submitForm() {
            if (this.editInvoice) {
                this.updateInvoice();
                return;
            }
            this.uploadInvoice();
        }

    },
    watch: {
        paymentTerms() {
            const futureDate = new Date();
            this.paymentDueDateUnix = futureDate.setDate(futureDate.getDate() + parseInt(this.paymentTerms));
            this.paymentDueDate = new Date(this.paymentDueDateUnix).toLocaleDateString('en-us', this.dateOptions);
        }
    },
    computed: {
        ...mapState(['editInvoice', 'currentInvoiceArray']),
    }
}
</script>
<style lang="scss" scoped>
.invoice-wrap {
    position: fixed;
    top: 0;
    left: 0;
    background-color: transparent;
    width: 100%;
    height: 100vh;
    overflow: scroll;

    &::-webkit-scrollbar {
        display: none;
    }


    @media(min-width: 900px) {
        left: 90px;
    }

    .invoice-content {
        position: relative;
        padding: 56px;
        max-width: 700px;
        width: 100%;
        background-color: #141625;
        color: #fff;
        box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

        h1 {
            margin-bottom: 20px;
            color: #fff;
        }

        h3 {
            margin-top: 12px;
            margin-bottom: 8px;
            font-size: 18px;
            color: #777f98;
        }

        h4 {
            color: #7c5dfa;
            font-size: 12px;
            margin-bottom: 24px;
        }
    }

    .input {
        margin-bottom: 10px;
    }

    .label {
        font-size: 12px;
    }

    input,
    select {
        width: 100%;
        background-color: #1e2139;
        color: #fff;
        border-radius: 4px;
        padding: 12px 4px;
        border: none;

        &:focus {
            outline: none;
        }
    }

    .client {
        .location-details {
            gap: 16px;

            div {
                flex: 1;
            }
        }
    }

    .invoice-work {
        .payment {
            gap: 24px;

            div {
                flex: 1;
            }
        }

        .work-items {
            .item-list {
                width: 100%;

                .table-heading,
                .table-items {
                    gap: 16px;
                    font-size: 12px;

                    .item-name {
                        flex-basis: 50%;
                    }

                    .qty {
                        flex-basis: 10%;
                    }

                    .price {
                        flex-basis: 20%;
                    }

                    .total {
                        flex-basis: 20%;
                        align-self: center;
                    }
                }

                .table-heading {
                    margin-bottom: 16px;

                    th {
                        text-align: left;
                    }
                }

                .table-items {
                    position: relative;
                    margin-bottom: 24px;

                    img {
                        position: absolute;
                        top: 15px;
                        right: 0;
                        width: 12px;
                        height: 16px;
                    }


                }

            }

            .button {
                color: #fff;
                background-color: #252945;
                align-items: center;
                justify-content: center;
                width: 100%;

                img {
                    margin-right: 4px;
                }
            }

        }
    }

    .save {
        margin-top: 60px;

        div {
            flex: 1;
        }

        .right {
            justify-content: flex-end;
        }
    }
}
</style>