<template>
  <v-app v-if="initialize" id="inspire">
    <v-navigation-drawer v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app>
      <v-list dense>
        <template v-for="item in items">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-col>
            <v-col cols="6" class="text-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-col>
          </v-row>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon
          >
            <template v-slot:activator>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i" @click>
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" @click="selectedItem=item">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="blue darken-3" dark>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <span class="hidden-sm-and-down">{{selectedItem.text}}</span>
      </v-toolbar-title>
      <div class="flex-grow-1"></div>
      <v-chip>
        <v-icon left color="blue lighten-5">mdi-account</v-icon>
        {{user.user_name}} {{user.user_surname}}
      </v-chip>
      <v-btn small style="margin-left:10px;" color="red" @click="signOut()">Sign out</v-btn>
    </v-app-bar>
    <v-content>
      <v-container>
        <transition name="slide-fade-slow">
          <v-row
            v-if="selectedView==='serverlist' && selectedItem.id==='serverlist'"
            :key="'serverlist'"
          >
            <ServerComponent
              @select-customer="selectCutomer"
              :serverList="serverList"
              :applicationList="applicationList"
              :customerList="customerList"
              @refresh-server-list="refreshServerList"
            ></ServerComponent>
          </v-row>
        </transition>
        <transition name="slide-fade-slow">
          <v-row
            v-if="selectedView==='customerDetails' && selectedItem.id==='serverlist'"
            :key="'customerDetails'"
          >
            <CustomerDetailsComponent
              @close="closeCustomerDetails"
              :applicationList="applicationList"
              :customerDetail="selectedCustomer"
              :customerList="customerList"
              @refresh-server-list="refreshServerList"
            ></CustomerDetailsComponent>
          </v-row>
        </transition>
        <transition name="slide-fade-slow">
          <v-row v-if="selectedItem.id==='loglist'" :key="'customerDetails'">
            <LogsComponent :applicationList="applicationList" :serverList="serverList"></LogsComponent>
          </v-row>
        </transition>
      </v-container>
      <v-dialog v-model="loginDialog" persistent max-width="800">
        <LoginComponent
          :organizations="organizations"
          @logIn="signIn($event)"
          @register="signUp($event)"
          v-if="loginDialog"
        ></LoginComponent>
      </v-dialog>
      <v-snackbar v-model="errorDialog" :color="'error'" :timeout="5000" :vertical="false">
        <span v-html="errorMessage"></span>
        <v-btn dark @click="errorDialog = false" style="float: right;">Close</v-btn>
      </v-snackbar>
    </v-content>
  </v-app>
</template>

<script>
import eventBus from "./services/eventBus";
import ServerComponent from "./components/Server";
import CustomerDetailsComponent from "./components/CustomerDetails";
import LoginComponent from "./components/Login";
import LogsComponent from "./components/CustomerLogs";

import ajax from "./services/ajaxCall";
export default {
  props: {
    source: String
  },
  data: () => ({
    initialize: false,
    loginDialog: false,
    dialog: false,
    drawer: false,
    errorDialog: false,
    selectedItem: {},
    errorMessage: "",
    selectedView: "serverlist",
    selectedCustomer: {},
    serverList: [],
    applicationList: [],
    customerList: [],
    token: null,
    user: {},
    userAppointments: [],
    organizations: [],
    items: [
      { id: "serverlist", icon: "mdi-server-network", text: "Server List" },
      { id: "loglist", icon: "mdi-math-log", text: "Logs" }
    ]
  }),
  methods: {
    async getServerList() {
      try {
        this.serverList = await ajax.get("/server");
      } catch (e) {
        eventBus.$emit("error", e.response.data);
      }
    },
    async getAllApplicationList() {
      try {
        this.applicationList = await ajax.get("/application");
      } catch (e) {
        eventBus.$emit("error", e.response.data);
      }
    },
    async getAllCustomerList() {
      try {
        this.customerList = await ajax.get("/server/customers");
      } catch (e) {
        eventBus.$emit("error", e.response.data);
      }
    },
    selectCutomer(customer) {
      this.selectedCustomer = customer;
      this.selectedView = "customerDetails";
    },
    closeCustomerDetails() {
      this.selectedView = "serverlist";
    },
    async refreshServerList() {
      this.closeCustomerDetails();
      this.getServerList();
    },
    async signIn(args) {
      try {
        debugger;
        const response = await ajax.postJTW(args);
        this.token = response.token;
        this.user = await ajax.getBearer("/users/me", this.token);
        debugger
          const _appointments = await ajax.getBearer("/appointment/", this.token);
          this.userAppointments = JSON.parse(_appointments);
          debugger
        this.loginDialog = false;
      } catch (error) {
        eventBus.$emit("error", "Invalid Username or Password");
      }
    },
    async signUp(args) {
      try {
        debugger;
        const response = await ajax.postNew(args, "/users/register");
        eventBus.$emit("register-ok", response.email);
      } catch (error) {
        eventBus.$emit("error", "User already exists");
      }
    },
    async signOut() {
      try {
        debugger;
        window.location.reload(true);
      } catch (e) {
        eventBus.$emit("error", e.response.data);
      }
    }
  },
  async mounted() {
    this.selectedItem = this.items[0];
    eventBus.$on("error", error => {
      this.errorDialog = true;
      this.errorMessage = error;
    });
    try {
      //await ajax.get("/api/organizations");
    } catch (e) {
      return;
    }
  },
  async created() {
    const response = await ajax.get("/organizations/false");
    this.organizations = response.data;
    console.log(this.organizations);
    this.initialize = true;
    this.loginDialog = true;
  },
  components: {
    ServerComponent,
    CustomerDetailsComponent,
    LoginComponent,
    LogsComponent
  }
};
</script>

<style  >
.slide-fade-slow-enter-active {
  transition: all 0.5s ease;
}

/* .slide-fade-slow-leave-active {
  transition: all .5s cubic-bezier(1, 0.5, 0.8, 1);
} */

.slide-fade-slow-enter,
.slide-fade-slow-leave-to {
  transform: translateX(200px);
  opacity: 0;
}
</style>