// Behind the screens: the 20 scenarios. Data only, no logic.
// Juniper Studio is a made-up business. Shape and rules: see the spec, section 5.
(typeof window !== "undefined" ? window : globalThis).BTS_SCENARIOS = [

  // ---------------------------------------------------------------- Money

  {
    id: "card-declined",
    group: "money",
    chip: "Card declined",
    setup: "Priya books a 60-minute session with Ava for Saturday at 4pm. Her card is declined.",
    beats: {
      demo: [
        { screen: "book", state: { practitioner: "Ava", session: "60-minute session", day: "Sat 24 Oct", slots: ["10:00", "12:00", "14:00", "16:00"], taken: ["10:00", "14:00"], selected: "16:00" }, caption: "Priya picks Saturday at 4pm with Ava." },
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 4242", status: "declined" }, caption: "Her bank declines the card." },
        { screen: "confirmed", state: { title: "You're booked!", lines: ["Sat 24 Oct, 4pm with Ava", "Deposit: £18.00"], tone: "ok" }, caption: "The demo says \"You're booked!\" anyway. It never checked whether the payment worked." },
        { screen: "owner", state: { title: "Saturday", rows: [{ label: "4pm, Priya with Ava", value: "No-show", tone: "bad" }, { label: "Deposit collected", value: "£0 of £18", tone: "bad" }] }, caption: "Saturday comes. Priya doesn't show, and there's no deposit to keep." }
      ],
      proper: [
        { screen: "book", state: { practitioner: "Ava", session: "60-minute session", day: "Sat 24 Oct", slots: ["10:00", "12:00", "14:00", "16:00"], taken: ["10:00", "14:00"], selected: "16:00" }, caption: "Priya picks Saturday at 4pm with Ava." },
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 4242", status: "declined" }, caption: "Her bank declines the card." },
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Add another card", status: "idle", note: "We're holding 4pm for you for 10 minutes.", banner: { tone: "warn", text: "Your card was declined. Try another card." } }, caption: "She's asked to try another card, and 4pm is held for her for 10 minutes." },
        { screen: "confirmed", state: { title: "You're booked", lines: ["Sat 24 Oct, 4pm with Ava", "Deposit paid: £18.00"], tone: "ok" }, caption: "Her second card works. Only now is she booked, with the deposit paid." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Only confirm a booking once the payment has actually gone through.", size: "quick" },
    sources: []
  },

  {
    id: "bank-check",
    group: "money",
    chip: "The bank's security check",
    setup: "Priya pays her deposit, and her bank asks her to confirm it's really her in her banking app.",
    beats: {
      demo: [
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 1881", status: "processing" }, caption: "Priya taps Pay. Her bank wants to check it's really her." },
        { screen: "bank-check", state: { status: "asking" }, caption: "UK rules need this check (3D Secure) for most online card payments." },
        { screen: "error", state: { kind: "spinner", title: "Processing...", lines: ["Please don't close this page."] }, caption: "The demo wasn't built for the check. It spins forever." },
        { screen: "owner", state: { title: "Today", rows: [{ label: "Online bookings", value: "0", tone: "bad" }, { label: "People who gave up paying", value: "Not recorded", tone: "bad" }] }, caption: "Clients give up halfway. The owner sees a quiet day and never knows why." }
      ],
      proper: [
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 1881", status: "processing" }, caption: "Priya taps Pay. Her bank wants to check it's really her." },
        { screen: "bank-check", state: { status: "asking" }, caption: "UK rules need this check (3D Secure) for most online card payments." },
        { screen: "bank-check", state: { status: "approved" }, caption: "She approves it in her banking app and comes straight back." },
        { screen: "confirmed", state: { title: "You're booked", lines: ["Sat 24 Oct, 4pm with Ava", "Deposit paid: £18.00"], tone: "ok" }, caption: "Booked and paid. Had she given up, the slot would go back on sale and the owner would see it." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Use a payment page that handles the bank's check, and test it with real cards.", size: "quick" },
    sources: [
      "https://www.ukfinance.org.uk/our-expertise/payments/strong-customer-authentication/strong-customer-authentication-frequently-asked-questions",
      "https://docs.stripe.com/strong-customer-authentication"
    ]
  },

  {
    id: "late-cancel",
    group: "money",
    chip: "A last-minute cancellation",
    setup: "Priya cancels her Saturday 4pm on Friday evening, 20 hours before. Juniper's rule: inside 24 hours, the deposit is kept.",
    beats: {
      demo: [
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1042", name: "Priya", when: "Sat 24 Oct, 4pm with Ava", lines: ["Deposit paid: £18.00", "Need to cancel?"], tone: "ok" }, caption: "Friday, 8pm. Priya opens her booking and taps Cancel." },
        { screen: "confirmed", state: { title: "Booking cancelled", lines: ["Your £18.00 deposit has been refunded."], tone: "ok" }, caption: "The demo refunds the lot. It never checked the 24-hour rule." },
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "14:00", name: "Tom" }, { time: "16:00", name: "Empty", flag: "cancelled" }] }] }, caption: "Ava's 4pm sits empty, and the deposit that should have covered it has gone." }
      ],
      proper: [
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1042", name: "Priya", when: "Sat 24 Oct, 4pm with Ava", lines: ["Deposit paid: £18.00", "Need to cancel?"], tone: "ok" }, caption: "Friday, 8pm. Priya opens her booking and taps Cancel." },
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1042", name: "Priya", when: "Sat 24 Oct, 4pm with Ava", lines: ["Less than 24 hours to go.", "Your £18.00 deposit will be kept.", "Cancel anyway?"], tone: "warn" }, caption: "Before she confirms, she's told the deposit is kept inside 24 hours." },
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "14:00", name: "Tom" }, { time: "16:00", name: "Back on sale", flag: "new" }] }] }, caption: "She cancels. The deposit covers the gap, and 4pm goes back on sale for someone else." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Build the cancellation rule into the system, and show it before the client confirms.", size: "quick" },
    sources: []
  },

  {
    id: "no-show",
    group: "money",
    chip: "Charging for a no-show",
    setup: "Priya doesn't turn up for her Saturday 4pm. Juniper charges no-shows the full £60.",
    beats: {
      demo: [
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "14:00", name: "Tom" }, { time: "16:00", name: "Priya" }] }], note: "4:20pm. No sign of Priya." }, caption: "4:20pm. Priya hasn't arrived and isn't answering." },
        { screen: "owner", state: { title: "Charge no-show", rows: [{ label: "Priya, 4pm with Ava", value: "£42.00 still to pay" }, { label: "Card on file", value: "Visa •••• 4242" }] }, caption: "Ava taps Charge no-show for the £42 still owed." },
        { screen: "error", state: { kind: "server", title: "Payment failed", lines: ["The bank wants the cardholder to approve this payment."] }, caption: "Refused. The card was saved without the bank's check, so the bank wants Priya there to approve it." },
        { screen: "owner", state: { title: "Saturday", rows: [{ label: "Priya, no-show", value: "£0 charged", tone: "bad" }, { label: "Ava's hour", value: "Lost", tone: "bad" }] }, caption: "Ava loses the hour and the £42 she was owed." }
      ],
      proper: [
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "14:00", name: "Tom" }, { time: "16:00", name: "Priya" }] }], note: "4:20pm. No sign of Priya." }, caption: "4:20pm. Priya hasn't arrived and isn't answering." },
        { screen: "owner", state: { title: "Charge no-show", rows: [{ label: "Priya, 4pm with Ava", value: "£42.00 still to pay" }, { label: "Card on file", value: "Visa •••• 4242" }] }, caption: "Ava taps Charge no-show for the £42 still owed." },
        { screen: "pay", state: { amount: "£42.00 no-show charge", card: "Visa •••• 4242", status: "paid", note: "Saved with Priya's agreement when she booked." }, caption: "It goes through. Priya agreed to this when booking, and her bank checked the card then." },
        { screen: "email", state: { from: "Juniper Studio", to: "Priya", subject: "Your missed appointment", lines: ["You missed your 4pm with Ava today.", "As agreed when you booked, we've charged £42.00."], tone: "warn" }, caption: "Priya gets an email saying what was charged and why, so there's no argument later." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Save cards through the payment provider, with the client's agreement and the bank's check when they book.", size: "a day or two" },
    sources: ["https://docs.stripe.com/payments/save-and-reuse"]
  },

  {
    id: "refund",
    group: "money",
    chip: "A refund",
    setup: "Sam is ill and has to cancel Thursday. Priya should get her £18 deposit back.",
    beats: {
      demo: [
        { screen: "owner", state: { title: "Refund", rows: [{ label: "Priya, Thu 2pm with Sam", value: "Deposit £18.00" }, { label: "Reason", value: "Sam is unwell" }] }, caption: "The owner taps Refund on Priya's deposit." },
        { screen: "owner", state: { title: "Refund", rows: [{ label: "Priya, Thu 2pm with Sam", value: "Refunded", tone: "ok" }] }, caption: "It says Refunded. But the button only changed a word on the screen." },
        { screen: "email", state: { from: "Priya", to: "Juniper Studio", subject: "Where's my refund?", lines: ["Hi, it's been two weeks and my £18 still hasn't come back. Can you check?"], tone: "bad" }, caption: "Two weeks later Priya chases it. The money never moved." }
      ],
      proper: [
        { screen: "owner", state: { title: "Refund", rows: [{ label: "Priya, Thu 2pm with Sam", value: "Deposit £18.00" }, { label: "Reason", value: "Sam is unwell" }] }, caption: "The owner taps Refund on Priya's deposit." },
        { screen: "owner", state: { title: "Refund", rows: [{ label: "Refund sent", value: "£18.00 to Visa •••• 4242", tone: "ok" }, { label: "Reaches Priya", value: "In a few working days" }] }, caption: "The money is actually sent back through the payment provider, and it's logged." },
        { screen: "email", state: { from: "Juniper Studio", to: "Priya", subject: "Your £18.00 refund", lines: ["Sam is unwell, so we've cancelled Thursday.", "Your £18.00 deposit is on its way back to your card."], tone: "ok" }, caption: "Priya is told straight away, so she never has to chase." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Make the Refund button send the money back through the payment provider, and keep a record.", size: "quick" },
    sources: []
  },

  {
    id: "paid-not-booked",
    group: "money",
    chip: "Paid but not booked",
    setup: "Priya pays on the bus. Her signal drops just as the payment goes through.",
    beats: {
      demo: [
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 4242", status: "processing" }, caption: "Priya pays on the bus. Her signal drops just as it goes through." },
        { screen: "error", state: { kind: "offline", title: "No connection", lines: ["Check your signal and try again."] }, caption: "Her money has gone, but her phone never heard back." },
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 4242", status: "idle", note: "No booking found. Please try again." }, caption: "Back online, the demo has no booking for her. So she pays again." },
        { screen: "owner", state: { title: "Priya", rows: [{ label: "Deposits taken", value: "£18.00 twice", tone: "bad" }, { label: "Bookings", value: "None", tone: "bad" }] }, caption: "She's charged twice and still has no booking. Sorting it out falls to the owner." }
      ],
      proper: [
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 4242", status: "processing" }, caption: "Priya pays on the bus. Her signal drops just as it goes through." },
        { screen: "error", state: { kind: "offline", title: "No connection", lines: ["Check your signal and try again."] }, caption: "Her money has gone, but her phone never heard back." },
        { screen: "confirmed", state: { title: "You're booked", lines: ["Sat 24 Oct, 4pm with Ava", "Deposit paid: £18.00"], tone: "ok" }, caption: "The payment provider tells the system directly, so she's booked even though her phone missed it." },
        { screen: "email", state: { from: "Juniper Studio", to: "Priya", subject: "Booking confirmed", lines: ["Sat 24 Oct, 4pm with Ava.", "Deposit paid: £18.00. One payment, one booking."], tone: "ok" }, caption: "Her confirmation arrives. Even if the payment is reported twice, it only counts once." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Let the payment provider confirm payments straight to the system, and count each payment only once.", size: "a day or two" },
    sources: []
  },

  // ---------------------------------------------------------------- Bookings

  {
    id: "last-slot",
    group: "bookings",
    chip: "Two people, last slot",
    setup: "Priya and Tom both tap Saturday at 4pm with Ava, her last free slot, at the same moment.",
    beats: {
      demo: [
        { screen: "book", state: { practitioner: "Ava", session: "60-minute session", day: "Sat 24 Oct", slots: ["10:00", "12:00", "14:00", "16:00"], taken: ["10:00", "12:00", "14:00"], selected: "16:00" }, caption: "4pm is Ava's last free slot on Saturday. Priya and Tom both tap it." },
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 4242", status: "processing" }, caption: "Both of them pay at the same time." },
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "16:00", name: "Priya", flag: "clash" }, { time: "16:00", name: "Tom", flag: "clash" }] }] }, caption: "Both are booked into the same hour." },
        { screen: "owner", state: { title: "Saturday, 4pm", rows: [{ label: "Priya", value: "Booked, paid £18", tone: "bad" }, { label: "Tom", value: "Booked, paid £18", tone: "bad" }, { label: "Ava", value: "Can only see one", tone: "bad" }] }, caption: "On Saturday one of them is turned away after paying. That's an awkward conversation." }
      ],
      proper: [
        { screen: "book", state: { practitioner: "Ava", session: "60-minute session", day: "Sat 24 Oct", slots: ["10:00", "12:00", "14:00", "16:00"], taken: ["10:00", "12:00", "14:00"], selected: "16:00" }, caption: "4pm is Ava's last free slot on Saturday. Priya and Tom both tap it." },
        { screen: "pay", state: { amount: "£18.00 deposit", card: "Visa •••• 4242", status: "processing" }, caption: "Both of them pay at the same time." },
        { screen: "book", state: { practitioner: "Ava", session: "60-minute session", day: "Sat 24 Oct", slots: ["10:00", "12:00", "14:00", "16:00"], taken: ["10:00", "12:00", "14:00"], held: "16:00", selected: null }, caption: "Priya got there first, so 4pm is held while she pays. Tom sees it's just been taken." },
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "16:00", name: "Priya" }] }, { who: "Kit", items: [{ time: "16:00", name: "Tom", flag: "new" }] }] }, caption: "One booking per slot, always. Tom books 4pm with Kit instead." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Hold a slot for a few minutes while someone pays, and never allow two bookings in one slot.", size: "a day or two" },
    sources: []
  },

  {
    id: "clocks-change",
    group: "bookings",
    chip: "The clocks go back",
    setup: "On 20 October, Priya books Tuesday 27th at 10am. The clocks go back in between, on Sunday 25 October.",
    beats: {
      demo: [
        { screen: "book", state: { practitioner: "Sam", session: "60-minute session", day: "Tue 27 Oct", slots: ["09:00", "10:00", "11:00"], selected: "10:00" }, caption: "On 20 October, Priya books Tuesday 27th at 10am with Sam." },
        { screen: "confirmed", state: { title: "You're booked", lines: ["Tue 27 Oct, 10am with Sam"], tone: "ok" }, caption: "Her confirmation says 10am. The clocks go back on Sunday 25 October." },
        { screen: "diary", state: { day: "Tue 27 Oct", columns: [{ who: "Sam", items: [{ time: "09:00", name: "Priya", flag: "moved" }] }] }, caption: "After the change, the demo shows her at 9am. It saved the time the wrong way." },
        { screen: "message", state: { channel: "text", to: "Priya", bubbles: [{ text: "Reminder: your appointment is tomorrow at 9:00am with Sam.", status: "delivered" }] }, caption: "Her reminder says 9am, Sam expects 9am, she planned for 10. Every booking after the change is out." }
      ],
      proper: [
        { screen: "book", state: { practitioner: "Sam", session: "60-minute session", day: "Tue 27 Oct", slots: ["09:00", "10:00", "11:00"], selected: "10:00" }, caption: "On 20 October, Priya books Tuesday 27th at 10am with Sam." },
        { screen: "confirmed", state: { title: "You're booked", lines: ["Tue 27 Oct, 10am with Sam"], tone: "ok" }, caption: "Her confirmation says 10am. The clocks go back on Sunday 25 October." },
        { screen: "diary", state: { day: "Tue 27 Oct", columns: [{ who: "Sam", items: [{ time: "10:00", name: "Priya" }] }] }, caption: "Times are saved with the UK clock change built in, so 10am stays 10am." },
        { screen: "message", state: { channel: "text", to: "Priya", bubbles: [{ text: "Reminder: your appointment is tomorrow at 10:00am with Sam.", status: "delivered" }] }, caption: "Her reminder says 10am, and so does Sam's diary." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Save every time with the UK clock change built in, and test bookings either side of the change.", size: "quick" },
    sources: ["https://www.gov.uk/when-do-the-clocks-change"]
  },

  {
    id: "off-sick",
    group: "bookings",
    chip: "Someone's off sick",
    setup: "Kit wakes up ill on Friday with five bookings.",
    beats: {
      demo: [
        { screen: "diary", state: { day: "Fri 23 Oct", columns: [{ who: "Kit", off: true, items: [{ time: "09:00", name: "Tom" }, { time: "10:00", name: "Priya" }, { time: "12:00", name: "Jo" }, { time: "14:00", name: "Dev" }, { time: "16:00", name: "Mia" }] }], note: "Kit is off sick today." }, caption: "7am. Kit is ill, with five bookings today." },
        { screen: "diary", state: { day: "Fri 23 Oct", columns: [{ who: "Kit", off: true, items: [{ time: "09:00", name: "Tom" }, { time: "10:00", name: "Priya" }, { time: "12:00", name: "Jo" }, { time: "14:00", name: "Dev" }, { time: "16:00", name: "Mia" }] }], note: "No way to move bookings. Call each client." }, caption: "The demo can't move anyone. The owner has to ring all five before 9am." },
        { screen: "owner", state: { title: "Kit off sick", rows: [{ label: "Clients reached", value: "3 of 5" }, { label: "Turned up anyway", value: "2 clients", tone: "bad" }] }, caption: "Two can't be reached and turn up anyway. That's two unhappy clients." }
      ],
      proper: [
        { screen: "diary", state: { day: "Fri 23 Oct", columns: [{ who: "Kit", off: true, items: [{ time: "09:00", name: "Tom" }, { time: "10:00", name: "Priya" }, { time: "12:00", name: "Jo" }, { time: "14:00", name: "Dev" }, { time: "16:00", name: "Mia" }] }], note: "Kit is off sick today." }, caption: "7am. Kit is ill, with five bookings today." },
        { screen: "diary", state: { day: "Fri 23 Oct", columns: [{ who: "Sam", items: [{ time: "09:00", name: "Tom", flag: "moved" }, { time: "14:00", name: "Dev", flag: "moved" }] }, { who: "Ava", items: [{ time: "12:00", name: "Jo", flag: "moved" }] }], note: "3 moved. Priya and Mia offered new times." }, caption: "The owner moves three bookings to Sam and Ava, who have gaps." },
        { screen: "message", state: { channel: "whatsapp", to: "Priya", bubbles: [{ text: "Sorry Priya, Kit is unwell today. Pick a new time here, or reply and we'll sort it.", status: "read" }] }, caption: "Everyone affected gets a message with a choice, sent in one go." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Let the owner move a day's bookings in one go and message everyone affected.", size: "a day or two" },
    sources: []
  },

  {
    id: "reminders",
    group: "bookings",
    chip: "Reminders that never arrive",
    setup: "Juniper sends every client a WhatsApp reminder the day before.",
    beats: {
      demo: [
        { screen: "message", state: { channel: "whatsapp", to: "Priya", bubbles: [{ text: "Reminder: Sat 24 Oct, 4pm with Ava. Reply C to cancel.", status: "sent" }] }, caption: "Friday, 4pm. Saturday's reminders are due to go out." },
        { screen: "message", state: { channel: "whatsapp", to: "Priya", bubbles: [{ text: "Reminder: Sat 24 Oct, 4pm with Ava. Reply C to cancel.", status: "not-sent" }] }, caption: "Nothing goes. The demo's reminders were a screen, with no WhatsApp business account behind them." },
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "10:00", name: "Jo" }, { time: "16:00", name: "Priya" }] }, { who: "Sam", items: [{ time: "12:00", name: "Dev" }] }], note: "3 no-shows today." }, caption: "Saturday has three no-shows. Nobody knows the reminders never went." },
        { screen: "owner", state: { title: "This month", rows: [{ label: "Reminders sent", value: "0", tone: "bad" }, { label: "Message costs", value: "Nobody planned for them", tone: "bad" }] }, caption: "And nobody planned for the cost. WhatsApp charges businesses for each reminder." }
      ],
      proper: [
        { screen: "message", state: { channel: "whatsapp", to: "Priya", bubbles: [{ text: "Reminder: Sat 24 Oct, 4pm with Ava. Reply C to cancel.", status: "sent" }] }, caption: "Friday, 4pm. Saturday's reminders are due to go out." },
        { screen: "message", state: { channel: "whatsapp", to: "Priya", bubbles: [{ text: "Reminder: Sat 24 Oct, 4pm with Ava. Reply C to cancel.", status: "read" }] }, caption: "Sent through WhatsApp's business service, using reminder wording WhatsApp has approved." },
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "10:00", name: "Jo" }, { time: "16:00", name: "Priya" }] }, { who: "Sam", items: [{ time: "12:00", name: "Dev" }] }], note: "All reminders delivered. One failed, so it went by text." }, caption: "Delivered and read. If one fails, it goes by text instead and the owner can see it." },
        { screen: "owner", state: { title: "This month", rows: [{ label: "Reminders sent", value: "240", tone: "ok" }, { label: "Message costs", value: "A few pence each, agreed", tone: "ok" }] }, caption: "Each message costs a few pence. It's on the monthly bill, and who pays was agreed upfront." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Set up WhatsApp's business service properly, with a text message backup and an agreed budget.", size: "a day or two" },
    sources: [
      "https://developers.facebook.com/docs/whatsapp/pricing/",
      "https://www.twilio.com/en-us/sms/pricing/gb"
    ]
  },

  // ---------------------------------------------------------------- Data and security

  {
    id: "booking-link",
    group: "data",
    chip: "Someone else's booking",
    setup: "Priya's booking link ends in a number. Out of curiosity, she changes it by one.",
    beats: {
      demo: [
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1042", name: "Priya", when: "Sat 24 Oct, 4pm with Ava", lines: ["Phone: 07700 900123", "Notes: prefers a quiet room"], tone: "ok" }, caption: "Priya's booking link ends in 1042." },
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1043", name: "Loading...", when: "", lines: [] }, caption: "Out of curiosity, she changes it to 1043." },
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1043", name: "Tom", when: "Sat 24 Oct, 2pm with Kit", lines: ["Phone: 07700 900456", "Notes: allergic to nuts"], tone: "bad" }, caption: "She can see Tom's booking, his phone number and his health notes. So can anyone." }
      ],
      proper: [
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1042", name: "Priya", when: "Sat 24 Oct, 4pm with Ava", lines: ["Phone: 07700 900123", "Notes: prefers a quiet room"], tone: "ok" }, caption: "Priya's booking link ends in 1042." },
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1043", name: "Loading...", when: "", lines: [] }, caption: "Out of curiosity, she changes it to 1043." },
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1043", locked: true, lines: ["This booking isn't yours.", "We only show a booking to the person who made it."], tone: "warn" }, caption: "The system checks it's her booking before showing anything. Tom's details stay private." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Check who's asking on every page, and use booking links that can't be guessed.", size: "quick" },
    sources: []
  },

  {
    id: "leaver-access",
    group: "data",
    chip: "A leaver still logged in",
    setup: "Sam left Juniper in September. The owner removes his access.",
    beats: {
      demo: [
        { screen: "team", state: { people: [{ name: "Ava", role: "Practitioner", access: "on" }, { name: "Kit", role: "Practitioner", access: "on" }, { name: "Sam", role: "Left in September", access: "on" }] }, caption: "Sam left last month. The owner taps Remove access." },
        { screen: "team", state: { people: [{ name: "Ava", role: "Practitioner", access: "on" }, { name: "Kit", role: "Practitioner", access: "on" }, { name: "Sam", role: "Left in September", access: "off" }] }, caption: "The list says his access has been removed." },
        { screen: "diary", state: { day: "Thu 22 Oct", columns: [{ who: "Ava", items: [{ time: "10:00", name: "Priya" }, { time: "14:00", name: "Tom" }] }, { who: "Kit", items: [{ time: "11:00", name: "Jo" }] }], note: "Signed in as Sam." }, caption: "But Sam's phone still opens the full diary and every client. The button only hid his name." }
      ],
      proper: [
        { screen: "team", state: { people: [{ name: "Ava", role: "Practitioner", access: "on" }, { name: "Kit", role: "Practitioner", access: "on" }, { name: "Sam", role: "Left in September", access: "on" }] }, caption: "Sam left last month. The owner taps Remove access." },
        { screen: "team", state: { people: [{ name: "Ava", role: "Practitioner", access: "on" }, { name: "Kit", role: "Practitioner", access: "on" }, { name: "Sam", role: "Left in September", access: "off" }] }, caption: "His login ends straight away, on every device he used." },
        { screen: "error", state: { kind: "server", title: "Signed out", lines: ["This account no longer has access."] }, caption: "Sam's phone is signed out. His old clients stay with Juniper." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Make removing someone end every login at once, and test it on their phone.", size: "quick" },
    sources: []
  },

  {
    id: "data-request",
    group: "data",
    chip: "A client asks for her data",
    setup: "Priya emails asking for a copy of everything Juniper holds about her, and then for it to be deleted.",
    beats: {
      demo: [
        { screen: "email", state: { from: "Priya", to: "Juniper Studio", subject: "My data", lines: ["Please send me a copy of everything you hold about me, then delete it."], tone: "ok" }, caption: "Priya asks for her data. By law, Juniper has one month to reply." },
        { screen: "data-request", state: { from: "Priya", asks: "copy", rows: [{ label: "Bookings", status: "found" }, { label: "Notes and messages", status: "missing" }, { label: "Payments", status: "missing" }], due: "Reply due by 24 Nov" }, caption: "The demo has no way to gather it. The owner digs through screens and messages by hand." },
        { screen: "data-request", state: { from: "Priya", asks: "delete", rows: [{ label: "Her account", status: "removed" }, { label: "Old messages", status: "kept" }, { label: "Backups", status: "kept" }], due: "Reply due by 24 Nov" }, caption: "Deleting removes her account, but copies stay in old messages and backups." }
      ],
      proper: [
        { screen: "email", state: { from: "Priya", to: "Juniper Studio", subject: "My data", lines: ["Please send me a copy of everything you hold about me, then delete it."], tone: "ok" }, caption: "Priya asks for her data. By law, Juniper has one month to reply." },
        { screen: "data-request", state: { from: "Priya", asks: "copy", rows: [{ label: "Bookings", status: "found" }, { label: "Notes and forms", status: "found" }, { label: "Messages", status: "found" }, { label: "Payments", status: "found" }], due: "Reply due by 24 Nov" }, caption: "Everything about Priya is gathered in one place, ready to send in minutes." },
        { screen: "data-request", state: { from: "Priya", asks: "delete", rows: [{ label: "Account and notes", status: "removed" }, { label: "Messages", status: "removed" }, { label: "Payment records", status: "kept" }], due: "Reply due by 24 Nov" }, caption: "Deleted everywhere, apart from payment records the business must keep for tax." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Keep client data organised, so it can be found, sent and deleted when someone asks.", size: "a day or two" },
    sources: [
      "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/subject-access-requests/a-guide-to-subject-access/",
      "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/"
    ]
  },

  {
    id: "health-notes",
    group: "data",
    chip: "Health notes",
    setup: "When she books, Priya mentions she's allergic to latex. The note is saved with her details.",
    beats: {
      demo: [
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1042", name: "Priya", when: "Sat 24 Oct, 4pm with Ava", lines: ["Anything we should know?", "I'm allergic to latex."], tone: "ok" }, caption: "Priya adds a note: she's allergic to latex. That's health information." },
        { screen: "owner", state: { title: "Client notes", rows: [{ label: "Who can read them", value: "Everyone with a login", tone: "bad" }, { label: "Where they're kept", value: "With everything else", tone: "bad" }] }, caption: "In the demo, everyone with a login can read every health note." },
        { screen: "email", state: { from: "Juniper Studio", to: "Kit", subject: "Client list", lines: ["Attached: all clients and notes.csv"], tone: "bad" }, caption: "When someone exports the client list, the health notes go out with it." }
      ],
      proper: [
        { screen: "my-booking", state: { url: "juniperstudio.example/booking/1042", name: "Priya", when: "Sat 24 Oct, 4pm with Ava", lines: ["Anything we should know?", "I'm allergic to latex."], tone: "ok" }, caption: "Priya adds a note: she's allergic to latex. That's health information." },
        { screen: "owner", state: { title: "Client notes", rows: [{ label: "Who can read them", value: "The owner and Ava", tone: "ok" }, { label: "Where they're kept", value: "Separately, with extra protection", tone: "ok" }] }, caption: "Under UK law, health notes are special category data. Only the people who need them can see them." },
        { screen: "owner", state: { title: "Notes log", rows: [{ label: "Ava viewed Priya's notes", value: "Sat 3:55pm" }, { label: "Client list exports", value: "Health notes left out", tone: "ok" }] }, caption: "Every look is logged, and exports leave health notes out unless they're truly needed." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Keep health notes separate, limit who sees them, log every look, and have a written reason to hold them.", size: "a day or two" },
    sources: ["https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/"]
  },

  {
    id: "backups",
    group: "data",
    chip: "The server dies",
    setup: "One Tuesday night, the server holding Juniper's bookings fails completely.",
    beats: {
      demo: [
        { screen: "error", state: { kind: "server", title: "Can't load bookings", lines: ["The server isn't responding."], clock: "Wed 07:30" }, caption: "Wednesday, 7:30am. The diary won't load. The server died overnight." },
        { screen: "error", state: { kind: "blank", title: "No data found", lines: ["0 clients", "0 bookings"] }, caption: "The developer rebuilds it, empty. There was no backup." },
        { screen: "diary", state: { day: "Wed 21 Oct", columns: [{ who: "Ava", items: [] }, { who: "Sam", items: [] }, { who: "Kit", items: [] }], note: "Every future booking is gone." }, caption: "Every future booking, deposit record and client note is gone. Clients just turn up." }
      ],
      proper: [
        { screen: "error", state: { kind: "server", title: "Can't load bookings", lines: ["The server isn't responding."], clock: "Wed 07:30" }, caption: "Wednesday, 7:30am. The diary won't load. The server died overnight." },
        { screen: "owner", state: { title: "Restore", rows: [{ label: "Last backup", value: "Today, 3am", tone: "ok" }, { label: "Restored to a new server", value: "7:52am", tone: "ok" }] }, caption: "Last night's backup is restored to a new server in minutes." },
        { screen: "diary", state: { day: "Wed 21 Oct", columns: [{ who: "Ava", items: [{ time: "10:00", name: "Priya" }] }, { who: "Sam", items: [{ time: "09:00", name: "Tom" }] }, { who: "Kit", items: [{ time: "11:00", name: "Jo" }] }], note: "Back to normal at 7:52am." }, caption: "The diary is back before the first client. At most, a few hours of changes need a check." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Back up every night to a separate place, and practise restoring it.", size: "quick" },
    sources: []
  },

  // ---------------------------------------------------------------- Running it

  {
    id: "saturday-down",
    group: "running",
    chip: "Down on a Saturday",
    setup: "Saturday at 10am, the busiest morning of the week. The booking page stops working.",
    beats: {
      demo: [
        { screen: "error", state: { kind: "server", title: "Something went wrong", lines: ["Please try again later."], clock: "Sat 10:02" }, caption: "Saturday, 10:02am. The booking page shows an error." },
        { screen: "message", state: { channel: "whatsapp", to: "The developer", bubbles: [{ text: "Hi, the booking page is down! Can you look?", status: "delivered" }] }, caption: "The owner messages the developer. It's his day off. Delivered, not read." },
        { screen: "owner", state: { title: "This weekend", rows: [{ label: "Booking page down for", value: "All weekend", tone: "bad" }, { label: "Bookings lost", value: "Unknown", tone: "bad" }] }, caption: "It stays down all weekend. Nobody knows how many bookings went elsewhere." }
      ],
      proper: [
        { screen: "error", state: { kind: "server", title: "Something went wrong", lines: ["Please try again later."], clock: "Sat 10:02" }, caption: "Saturday, 10:02am. The booking page shows an error." },
        { screen: "message", state: { channel: "text", to: "On call", bubbles: [{ text: "Alert: Juniper booking page error at 10:02. Looking now.", status: "read" }] }, caption: "An alert reaches whoever's on call within a minute, before anyone has to ring." },
        { screen: "confirmed", state: { title: "Back to normal", lines: ["Fixed at 10:19", "2 bookings came in during the gap. Both kept."], tone: "ok" }, caption: "Fixed in 17 minutes, because a response time was agreed upfront and someone is on call." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Monitoring that alerts someone, and a written promise of how fast it's fixed, weekends included.", size: "a day or two" },
    sources: []
  },

  {
    id: "moving-over",
    group: "running",
    chip: "Moving from the old system",
    setup: "Juniper switches from its old booking system to the new one.",
    beats: {
      demo: [
        { screen: "owner", state: { title: "Moving over", rows: [{ label: "Clients", value: "1,240" }, { label: "Future bookings", value: "312" }, { label: "Deposits already paid", value: "£4,380" }, { label: "Client notes", value: "2,105" }] }, caption: "Juniper has years of clients, notes and future bookings in its old system." },
        { screen: "owner", state: { title: "Moving over", rows: [{ label: "Clients", value: "1,240 moved", tone: "ok" }, { label: "Future bookings", value: "Not moved", tone: "bad" }, { label: "Deposits already paid", value: "Not moved", tone: "bad" }, { label: "Client notes", value: "Not moved", tone: "bad" }] }, caption: "The demo brings in the client list. Bookings, deposits and notes stay behind." },
        { screen: "email", state: { from: "Tom", to: "Juniper Studio", subject: "My booking?", lines: ["I booked and paid for Saturday in the summer, but your new app says I have nothing booked."], tone: "bad" }, caption: "Clients who booked months ago find nothing, and their deposits are stuck in the old system." }
      ],
      proper: [
        { screen: "owner", state: { title: "Moving over", rows: [{ label: "Clients", value: "1,240" }, { label: "Future bookings", value: "312" }, { label: "Deposits already paid", value: "£4,380" }, { label: "Client notes", value: "2,105" }] }, caption: "Juniper has years of clients, notes and future bookings in its old system." },
        { screen: "owner", state: { title: "Moving over", rows: [{ label: "Clients", value: "1,240 of 1,240", tone: "ok" }, { label: "Future bookings", value: "312 of 312", tone: "ok" }, { label: "Deposits already paid", value: "£4,380 matched", tone: "ok" }, { label: "Client notes", value: "2,105 of 2,105", tone: "ok" }] }, caption: "Bookings, deposits and notes are moved and counted, so nothing is lost." },
        { screen: "diary", state: { day: "Sat 24 Oct", columns: [{ who: "Ava", items: [{ time: "10:00", name: "Tom" }, { time: "16:00", name: "Priya" }] }], note: "Old and new checked side by side for a week." }, caption: "Both systems are checked side by side for a week before the old one is switched off." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Plan the move: take everything out, check the counts, and switch over in a quiet week.", size: "a proper piece of work" },
    sources: []
  },

  {
    id: "developer-gone",
    group: "running",
    chip: "The developer disappears",
    setup: "A year in, Juniper's developer stops replying.",
    beats: {
      demo: [
        { screen: "message", state: { channel: "whatsapp", to: "The developer", bubbles: [{ text: "Hi, can you add a new session type?", status: "delivered" }, { text: "Hello? Are you still there?", status: "delivered" }] }, caption: "A year on, the developer stops replying." },
        { screen: "owner", state: { title: "What Juniper owns", rows: [{ label: "The code", value: "On his laptop", tone: "bad" }, { label: "The server", value: "His account", tone: "bad" }, { label: "The web address", value: "In his name", tone: "bad" }] }, caption: "Juniper owns none of it. The code, the server and even the web address are in his name." },
        { screen: "error", state: { kind: "blank", title: "This site can't be reached", lines: ["The web address has expired."] }, caption: "When his card stops paying for the server and the address, the whole thing switches off." }
      ],
      proper: [
        { screen: "message", state: { channel: "whatsapp", to: "The developer", bubbles: [{ text: "Hi, can you add a new session type?", status: "delivered" }, { text: "Hello? Are you still there?", status: "delivered" }] }, caption: "A year on, the developer stops replying." },
        { screen: "owner", state: { title: "What Juniper owns", rows: [{ label: "The code", value: "Juniper's copy, with notes", tone: "ok" }, { label: "The server", value: "Juniper's account", tone: "ok" }, { label: "The web address", value: "In Juniper's name", tone: "ok" }] }, caption: "Everything has been in Juniper's name from day one: the code, the accounts and the address." },
        { screen: "confirmed", state: { title: "Handed over", lines: ["A new developer takes over within a week.", "Nothing has to be rebuilt."], tone: "ok" }, caption: "Another developer picks it up and carries on. Nothing has to be rebuilt." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Put the code and every account in the business's own name, with handover notes, from the start.", size: "quick" },
    sources: []
  },

  {
    id: "phone-update",
    group: "running",
    chip: "A phone update",
    setup: "A big phone update comes out in September, and Priya installs it overnight.",
    beats: {
      demo: [
        { screen: "book", state: { practitioner: "Ava", session: "60-minute session", day: "Sat 24 Oct", slots: ["10:00", "12:00", "14:00", "16:00"], taken: ["10:00"], selected: "16:00" }, caption: "Priya updates her phone, then goes to book." },
        { screen: "error", state: { kind: "blank", title: "Nothing happens", lines: ["The Book button does nothing."] }, caption: "On updated phones, the Book button no longer works. Nobody tested it." },
        { screen: "owner", state: { title: "This week", rows: [{ label: "Online bookings", value: "3 (usually 40)", tone: "bad" }] }, caption: "Bookings quietly drop for a week before anyone notices why." }
      ],
      proper: [
        { screen: "book", state: { practitioner: "Ava", session: "60-minute session", day: "Sat 24 Oct", slots: ["10:00", "12:00", "14:00", "16:00"], taken: ["10:00"], selected: "16:00" }, caption: "Priya updates her phone, then goes to book." },
        { screen: "confirmed", state: { title: "You're booked", lines: ["Sat 24 Oct, 4pm with Ava", "Deposit paid: £18.00"], tone: "ok" }, caption: "It works. The page was tested on the new update before most people had it." },
        { screen: "owner", state: { title: "This week", rows: [{ label: "Online bookings", value: "41", tone: "ok" }, { label: "Checked after the update", value: "Done", tone: "ok" }] }, caption: "Bookings carry on as normal. Checking after big updates is part of looking after it." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Test on new phone and browser versions as they arrive, as part of the monthly care.", size: "quick" },
    sources: []
  },

  {
    id: "costs-creep",
    group: "running",
    chip: "Costs that creep up",
    setup: "Juniper is about to commit to a new booking system and wants to know the running costs.",
    beats: {
      demo: [
        { screen: "email", state: { from: "Juniper Studio", to: "The developer", subject: "Running costs?", lines: ["Before we go ahead, what will it cost each month to run?"], tone: "ok" }, caption: "Before going ahead, Juniper asks what it will cost each month to run." },
        { screen: "owner", state: { title: "Running costs, month 8", rows: [{ label: "Bigger server", value: "£45", tone: "bad" }, { label: "Messages", value: "£28", tone: "bad" }, { label: "Fixes, by the hour", value: "£180", tone: "bad" }] }, caption: "The answer was \"almost nothing\". By month eight: a bigger server, message bills and fixes by the hour." },
        { screen: "owner", state: { title: "Year one", rows: [{ label: "Running costs", value: "£1,640", tone: "bad" }, { label: "What was expected", value: "About £60", tone: "bad" }] }, caption: "Year one cost far more to run than anyone expected, and the bill changes every month." }
      ],
      proper: [
        { screen: "email", state: { from: "Juniper Studio", to: "The developer", subject: "Running costs?", lines: ["Before we go ahead, what will it cost each month to run?"], tone: "ok" }, caption: "Before going ahead, Juniper asks what it will cost each month to run." },
        { screen: "owner", state: { title: "Monthly costs, agreed upfront", rows: [{ label: "Hosting and backups", value: "Fixed figure", tone: "ok" }, { label: "Messages", value: "Budget agreed", tone: "ok" }, { label: "Support and updates", value: "In the monthly fee", tone: "ok" }] }, caption: "The answer is written down: hosting, messages, support and updates, each with a figure." },
        { screen: "owner", state: { title: "Year one", rows: [{ label: "Running costs", value: "As quoted", tone: "ok" }, { label: "Surprises", value: "None", tone: "ok" }] }, caption: "Year one costs what was quoted, so the business can plan." }
      ]
    },
    outcome: { demo: "broke", proper: "survived" },
    takes: { line: "Write down every running cost before building: hosting, messages, support and updates.", size: "quick" },
    sources: []
  }
];
