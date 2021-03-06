<template>
  <v-app v-if="initialize" id="inspire">
    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="#004254" dark>
      <div class="flex-grow-1">
        <img style="width:185px" src="/Content/EA-white.svg" alt />
      </div>
      <v-chip>
        <v-icon left color="#4DE17D">mdi-account</v-icon>
        {{user.user_name}} {{user.user_surname}}
      </v-chip>
      <v-btn small style="margin-left:10px;" color="#0BD4C3" @click="signOut()">Sign out</v-btn>
    </v-app-bar>
    <v-content>
      <v-container>
        <transition name="slide-fade-slow">
          <Appointment
            v-if="!loginDialog && user.is_client"
            @newAppointment="createNewAppointment($event)"
            @refresh="fetchAppointments"
            :user="user"
            :organizations="organizations"
            :appointments="userAppointments"
          ></Appointment>
          <AppointmentCivil
            v-if="!loginDialog && !user.is_client"
            @approveAppointment="approveAppointment($event)"
            @refresh="fetchAppointments"
            :user="user"
            :organizations="organizations"
            :appointments="userAppointments"
          ></AppointmentCivil>
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
import Appointment from "./components/Appointment";
import AppointmentCivil from "./components/AppointmentCivil";
import LoginComponent from "./components/Login";
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
    async signIn(args) {
      try {
        const response = await ajax.postJTW(args);
        this.token = response.token;
        this.user = await ajax.getBearer("/users/me", this.token);
        const _appointments = await ajax.getBearer("/appointment/", this.token);
        this.userAppointments = JSON.parse(_appointments);
        this.loginDialog = false;
      } catch (error) {
        eventBus.$emit("error", "Invalid Username or Password");
      }
    },
    async signUp(args) {
      try {
        const response = await ajax.postNew(args, "/users/register");
        eventBus.$emit("register-ok", response.email);
      } catch (error) {
        eventBus.$emit("error", "User already exists");
      }
    },
    async signOut() {
      try {
        window.location.reload(true);
      } catch (e) {
        eventBus.$emit("error", e.response.data);
      }
    },
    async createNewAppointment(obj) {
      try {
        const response = await ajax.post("/appointment/", obj);
        const _appointments = await ajax.getBearer("/appointment/", this.token);
        this.userAppointments = JSON.parse(_appointments);
      } catch (error) {
        eventBus.$emit("error", error.message);
      }
    },
    async fetchAppointments() {
      const _appointments = await ajax.getBearer("/appointment/", this.token);
      this.userAppointments = JSON.parse(_appointments);
    },
    async approveAppointment(obj) {
      try {
        const response = await ajax.put("/appointment/", obj);
        const _appointments = await ajax.getBearer("/appointment/", this.token);
        this.userAppointments = JSON.parse(_appointments);
      } catch (error) {
        eventBus.$emit("error", error.message);
      }
    }
  },
  async mounted() {
    eventBus.$on("error", error => {
      this.errorDialog = true;
      this.errorMessage = error;
    });
  },
  async created() {
    window.console.log("new");
    const response = await ajax.get("/organizations/false/");
    this.organizations = response.data;
    console.log(this.organizations);
    this.initialize = true;
    this.loginDialog = true;
  },
  components: {
    Appointment,
    AppointmentCivil,
    LoginComponent
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