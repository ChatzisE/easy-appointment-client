<template>
  <v-data-table :headers="headers" :items="appointementsList" sort-by="date" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>My Appointments</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-btn @click="$emit('refresh')" icon color="#4DE17D">
          <v-icon>mdi-cached</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="#004254" dark class="mb-2" v-bind="attrs" v-on="on">New Appointment</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-combobox
                      v-model="editedItem.org"
                      :items="organizations"
                      item-text="preferredLabel"
                      item-value="code"
                      label="Select Organization"
                    ></v-combobox>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
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
                        color="#004254"
                        event-color="#004254"
                        :min="minDT"
                        @input="dateMenu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
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
                        color="#004254"
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
              <v-btn color="#0BD4C3" text @click="close">Cancel</v-btn>
              <v-btn color="#0BD4C3" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
      <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
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
    minDT: moment()
      .add(-1, "days")
      .format(),
    timeMenu: false,
    headers: [
      {
        text: "Organization",
        align: "start",
        value: "org_name"
      },
      { text: "Date", value: "appointment_date" },
      { text: "Status", value: "is_approved" }
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
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Appointment" : "Edit Appointment";
    }
  },
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
      this.appointments.forEach(a => {
        const _appointment = {
          user_id: a.user_id,
          org_code: a.org_code,
          is_approved: a.is_approved,
          org_name: a.org_name,
          appointment_date: a.appointment_datetime,
          appointment_time: moment(a.appointment_datetime).format("HH.mm")
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
      this.editedItem = Object.assign({}, item);
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
      if (this.editedIndex > -1) {
        Object.assign(
          this.appointementsList[this.editedIndex],
          this.editedItem
        );
      } else {
        const _datetime = moment(
          `${this.editedItem.appointment_date} ${this.editedItem.appointment_time}`
        ).format();
        const obj = {
          user_id: this.user.id,
          org_code: Number(this.editedItem.org.code),
          org_name: this.editedItem.org.preferredLabel,
          appointment_datetime: _datetime
        };
        this.$emit("newAppointment", obj);
      }
      this.close();
    }
  }
};
</script>
