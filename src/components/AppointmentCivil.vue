<template>
  <v-data-table :headers="headers" :items="appointementsList" sort-by="date" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>My Organization Appointments</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-toolbar-title>{{org_name}}</v-toolbar-title>
        <v-btn @click="$emit('refresh')" icon color="#4DE17D">
          <v-icon>mdi-cached</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Approve Appointment</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-menu
                      :close-on-content-click="false"
                      :nudge-right="40"
                      v-model="dateMenu"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="editedItem.appointment_date"
                          label="Select date"
                          prepend-icon="event"
                          readonly
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="editedItem.appointment_date"
                        :min="dtNow"
                        @input="dateMenu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" sm="12" md="12">
                    <v-menu
                      ref="menu"
                      v-model="timeMenu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      :return-value.sync="editedItem.appointment_time"
                      transition="scale-transition"
                      offset-y
                      max-width="290px"
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="editedItem.appointment_time"
                          label="Select time"
                          prepend-icon="access_time"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-time-picker
                        v-if="timeMenu"
                        v-model="editedItem.appointment_time"
                        full-width
                        @click:minute="$refs.menu.save(editedItem.appointment_time)"
                      ></v-time-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        v-show="!item.is_approved"
        formTitlesmall
        color="green"
        class="mr-2"
        @click="editItem(item)"
      >mdi-check-bold</v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
    <template v-slot:item.is_approved="{ item }">
      <v-chip
        :color="getColor(item.is_approved)"
        dark
      >{{ item.is_approved ? 'Approved' : 'Pending' }}</v-chip>
    </template>
    <template v-slot:item.appointment_date="{ item }">{{ item.appointment_date | moment }}</template>
  </v-data-table>
</template>
<script>
import ajax from "../services/ajaxCall";
import eventBus from "../services/eventBus";
import moment from "moment";
export default {
  props: ["user", "organizations", "appointments"],
  data: () => ({
    dialog: false,
    dateMenu: false,
    timeMenu: false,
    dtNow: moment(),
    headers: [
      {
        text: "Organization",
        align: "start",
        value: "org_name"
      },
      { text: "Date", value: "appointment_date" },
      { text: "Status", value: "is_approved" },
      { text: "Aprrove", value: "actions", sortable: false }
    ],
    appointementsList: [],
    editedIndex: -1,
    editedItem: {
      user_id: null,
      org: null,
      is_approved: false,
      appointment_date: null,
      appointment_time: null
    },
    defaultItem: {
      user_id: null,
      org: null,
      is_approved: false,
      appointment_date: null,
      appointment_time: null
    }
  }),
  filters: {
    moment: function(value) {
      return moment(value).format("MMMM Do YYYY, hh:mm");
    }
  },
  computed: {},
  watch: {
    dialog(val) {
      val || this.close();
    },
    appointments(val) {
      this.appointementsList = [];
      this.initialize();
    }
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      const org = this.organizations.find(
        o => o.code === this.user.organization.toString()
      ).preferredLabel;
      this.org_name = org;
      this.appointments.forEach(a => {
        const _appointment = {
          user_id: a.user_id,
          org_code: a.org_code,
          is_approved: a.is_approved,
          org_name: a.org_name,
          appointment_id: a.id,
          appointment_date: a.appointment_datetime,
          appointment_time: moment(a.appointment_datetime).format("HH:mm")
        };
        this.appointementsList.push(_appointment);
      });
    },
    getColor(approved) {
      if (approved) return "green";
      else return "orange";
    },
    editItem(item) {
      this.editedIndex = this.appointementsList.indexOf(item);
      const dtParts = item.appointment_date.split("T");
      const obj = {
        user_id: item.user_id,
        org: item.org_code,
        is_approved: item.is_approved,
        appointment_date: dtParts[0],
        appointment_time: item.appointment_time,
        appointment_id: item.appointment_id
      };
      this.editedItem = obj;
      this.dialog = true;
    },
    deleteItem(item) {
      const index = this.appointementsList.indexOf(item);
      confirm("Are you sure you want to delele this appointment?") &&
        this.appointementsList.splice(index, 1);
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      const _datetime = moment(
        `${this.editedItem.appointment_date} ${this.editedItem.appointment_time}`
      ).format();
      const obj = {
        org_code: this.editedItem.org,
        appointment_id: this.editedItem.appointment_id,
        appointment_datetime: _datetime,
        user_id: this.user.id
      };
      this.$emit("approveAppointment", obj);
      this.close();
    }
  }
};
</script>
