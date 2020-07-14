<template>
  <v-card min-width="400" class="mx-auto">
    <v-tabs
      v-model="tab"
      show-arrows
      background-color="#004254"
      icons-and-text
      dark
      grow
    >
      <v-tabs-slider color="#004254"></v-tabs-slider>
      <v-tab v-for="i in tabs" :key="i.name">
        <v-icon large>{{ i.icon }}</v-icon>
        <div class="caption py-1">{{ i.name }}</div>
      </v-tab>
      <v-tab-item>
        <v-card class="px-4">
          <v-card-text>
            <v-form ref="loginForm" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="loginEmail"
                    :rules="loginEmailRules"
                    label="E-mail"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="loginPassword"
                    :append-icon="show1?'eye':'eye-off'"
                    :rules="[rules.required, rules.min]"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-1"
                    label="Password"
                    hint="At least 8 characters"
                    counter
                    @click:append="show1 = !show1"
                  ></v-text-field>
                </v-col>
                <v-col class="d-flex" cols="12" sm="6" xsm="12"></v-col>
                <v-spacer></v-spacer>
                <v-col class="d-flex" cols="12" sm="3" xsm="12" align-end>
                  <v-btn x-large block :disabled="!valid" color="#4DE17D" @click="login">Login</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card class="px-4">
          <v-card-text>
            <v-form ref="registerForm" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    v-model="firstName"
                    :rules="[rules.required]"
                    label="First Name"
                    maxlength="20"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    v-model="lastName"
                    :rules="[rules.required]"
                    label="Last Name"
                    maxlength="20"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="password"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min]"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-1"
                    label="Password"
                    hint="At least 8 characters"
                    counter
                    @click:append="show1 = !show1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    block
                    v-model="verify"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required]"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-1"
                    label="Confirm Password"
                    counter
                    @click:append="show1 = !show1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-switch
                    v-model="clientFlag"
                    :label="((clientFlag) ? 'Client' : 'Civil Servicer')"
                  ></v-switch>
                  <v-col v-show="!clientFlag" cols="12">
                    <v-combobox
                      v-model="civilService"
                      :items="organizations"
                      item-text="preferredLabel"
                      item-value="code"
                      label="Choose your organization"
                    ></v-combobox>
                  </v-col>
                </v-col>
                <v-spacer></v-spacer>
                <v-col class="d-flex ml-auto" cols="12" sm="3" xsm="12">
                  <v-btn x-large block :disabled="!valid" color="#4DE17D" @click="register">Register</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>
<script>
import ajax from "../services/ajaxCall";
import eventBus from "../services/eventBus";
export default {
  props: ["organizations"],
  data: () => ({
    dialog: true,
    tab: 0,
    tabs: [
      { name: "Login", icon: "mdi-account" },
      { name: "Register", icon: "mdi-account-outline" }
    ],
    valid: true,
    civilService: null,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    verify: "",
    clientFlag: true,
    loginPassword: "",
    loginEmail: "",
    loginEmailRules: [
      v => !!v || "Required",
      v => /.+@.+\..+/.test(v) || "E-mail must be valid"
    ],
    emailRules: [
      v => !!v || "Required",
      v => /.+@.+\..+/.test(v) || "E-mail must be valid"
    ],

    show1: false,
    rules: {
      required: value => !!value || "Required.",
      min: v => (v && v.length >= 8) || "Min 8 characters"
    }
  }),
  methods: {
    keyDown(event) {
      if (event.keyCode === 13) {
        this.login();
      }
    },
    login() {
      const obj = {
        username: this.loginEmail,
        password: this.loginPassword
      };
      this.$emit("logIn", obj);
    },
    register() {
      debugger
      const obj = {
        email: this.email,
        is_active: true,
        is_superuser: false,
        password: this.password,
        user_name: this.firstName,
        user_surname: this.lastName,
        is_client: this.clientFlag,
        organization: (this.clientFlag ? 0:this.civilService.code)
      };
      this.$emit("register", obj);
    }
  },
  created() {},
  mounted() {
    eventBus.$on("register-ok", email => {
      this.tab = 0;
      this.loginEmail = email;
    });
  },
  computed: {}
};
</script>
