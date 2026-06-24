const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');
const Election = require('./models/Election');
const Nomination = require('./models/Nomination');
const Vote = require('./models/Vote');
const { encrypt } = require('./utils/encryption');

dotenv.config();

const NAMES = [
  'Aadhya Sharma', 'Aarav Patel', 'Aarushi Verma', 'Abhay Singh', 'Abhilasha Rao',
  'Abhimanyu Gupta', 'Abhipsha Das', 'Abhiram Nair', 'Aditi Mishra', 'Aditya Srinivas',
  'Advait Iyer', 'Aishwarya Krishnan', 'Ajay Thakur', 'Akhil Reddy', 'Akhila Menon',
  'Akshay Joshi', 'Akshita Saxena', 'Amanpreet Kaur', 'Amarjeet Singh', 'Amrita Banerjee',
  'Amulya Desai', 'Ananya Sen', 'Aniket Pawar', 'Aniket Wagh', 'Anirudh Hegde',
  'Anita Devi', 'Anjali Rao', 'Ankita Jain', 'Ankur Bhatia', 'Anmol Tiwari',
  'Anshul Agarwal', 'Antara Ghosh', 'Anupama Shetty', 'Anushka Salvi', 'Archan Nair',
  'Arjun Mehta', 'Arpita Roy', 'Arunachalam Pillai', 'Arundhati Iyengar', 'Arvind Swamy',
  'Aryan Khanna', 'Asha Sharma', 'Ashish Gupta', 'Ashok Kumar', 'Ashutosh Gowda',
  'Astha Agarwal', 'Atharva Kulkarni', 'Atul Deshmukh', 'Avani Bhatt', 'Ayush Tiwari',
  'Bablu Yadav', 'Balaji Srinivasan', 'Bhavana Solanki', 'Bhavik Shah', 'Bhuvaneshwari Devi',
  'Bijoy Das', 'Bikram Chatterjee', 'Brijesh Pandey', 'Chaitanya Rajan', 'Chandni Kapoor',
  'Chetan Naik', 'Chhaya Devi', 'Chirag Luthra', 'Darshan Raj', 'Deepak Sharma',
  'Deepika Nair', 'Devendra Pratap', 'Devi Prasad', 'Dhananjay Kumar', 'Dharini Balan',
  'Dharmendra Singh', 'Dhruv Sheth', 'Dilip Rao', 'Dinesh More', 'Dipti Ranjan',
  'Divya Rani', 'Diya Chopra', 'Durga Prasad', 'Eashwar Bhat', 'Esha Khandelwal',
  'Eshaan Kohli', 'Faisal Khan', 'Farzana Sheikh', 'Ganesh Prabhu', 'Gargi Deshpande',
  'Gaurav Pillai', 'Gautam Adhikari', 'Gayatri Devi', 'Geeta Rani', 'Girish Naidu',
  'Gita Devi', 'Gokul Raj', 'Gopalakrishnan Nair', 'Gowri Shankar', 'Gunjan Saxena',
  'Hanumantha Reddy', 'Hari Babu', 'Harini Subramanian', 'Harish Rao', 'Harsh Vardhan',
  'Harshita Singh', 'Hemant Kumar', 'Hema Malini', 'Himanshu Tyagi', 'Hina Khan',
  'Inderjit Kaur', 'Indira Krishnan', 'Indu Devi', 'Ishaan Seth', 'Ishita Sen',
  'Ishanvi Nair', 'Jagdish Prasad', 'Jai Prakash', 'Janaki Ammal', 'Jasmine Kaur',
  'Jayashree Mohan', 'Jayesh Bhavsar', 'Jeevitha Rajan', 'Jignesh Mehta', 'Jitendra Yadav',
  'Jyoti Kumari', 'Jyotsna Rao', 'Kabir Bajaj', 'Kailash Chandra', 'Kajal Aggarwal',
  'Kalpana Chawla', 'Kamal Kishore', 'Kamala Devi', 'Kameshwar Rao', 'Kanchan Debnath',
  'Karanveer Bhat', 'Karthik Subramanian', 'Karuna Devi', 'Kashish Sheikh', 'Kasturi Rangan',
  'Kaushik Banerjee', 'Kavita Joshi', 'Kavya Shankar', 'Khushboo Mirza', 'Kiran Moodgal',
  'Kirti Sharma', 'Kishore Kumar', 'Kritika Saha', 'Kumar Gaurav', 'Kumud Verma',
  'Lakshman Rao', 'Lakshmi Narayana', 'Lalita Devi', 'Lalit Mohan', 'Lata Rani',
  'Lavanya Krishnan', 'Leela Devi', 'Likhita Gowda', 'Lokesh Sharma', 'Madhavi Latha',
  'Madhu Sudan', 'Magesh Kumar', 'Mahesh Babu', 'Mala Sinha', 'Mallika Arjun',
  'Mamata Devi', 'Mandeep Kaur', 'Mangal Singh', 'Mani Ratnam', 'Manisha Koirala',
  'Manish Tiwari', 'Manoj Bajpayee', 'Manu Krishnan', 'Mariya Joseph', 'Meena Kumari',
  'Meenakshi Sundaram', 'Meera Nair', 'Milan Sen', 'Mina Devi', 'Mitali Ghosh',
  'Mohan Krishnan', 'Mohini Sharma', 'Murali Krishna', 'Murugan Chettiar', 'Nagesh Rao',
  'Naina Kapur', 'Nanda Kishore', 'Nandini Devi', 'Nani Rao', 'Narasimha Murthy',
  'Narendra Modi', 'Naresh Kumar', 'Naveen Chandra', 'Navya Nair', 'Neelam Saxena',
  'Neeraj Chopra', 'Neha Sharma', 'Nikhil Dsouza', 'Nikita Agarwal', 'Nina Gupta',
  'Nirmala Sitharaman', 'Nisha Desai', 'Nishant Rai', 'Nitya Prakash', 'Nivedita Das',
  'Om Prakash', 'Omkar Bhat', 'Padmini Rani', 'Padma Shri', 'Pallavi Joshi',
  'Pankaj Tripathi', 'Parvati Devi', 'Pavan Kumar', 'Pavitra Punia', 'Phoolan Devi',
  'Poonam Dhillon', 'Prabhu Deva', 'Pradeep Singh', 'Pragya Mishra', 'Prakash Raj',
  'Pranali Patil', 'Pranav Iyer', 'Prarthana Bele', 'Prasad Rao', 'Pratibha Singh',
  'Praveen Kumar', 'Preeti Rani', 'Prem Chopra', 'Prema Devi', 'Priya Sharma',
  'Priyanka Tiwari', 'Puneet Srivastava', 'Punit Malhotra', 'Purnima Devi', 'Purushottam Shet',
  'Pushpa Devi', 'Rachna Banerjee', 'Radha Rani', 'Radhika Rao', 'Raghavendra Rao',
  'Ragini Khanna', 'Rahul Gandhi', 'Raj Kapoor', 'Raja Rani', 'Rajeev Gandhi',
  'Rajeshwari Devi', 'Rajkumari Rao', 'Rajnikanth', 'Rajpal Yadav', 'Rakhi Sawant',
  'Rakshit Shetty', 'Ram Charan', 'Rama Devi', 'Ramesh Babu', 'Ramesh Sippy',
  'Rameshwari Devi', 'Ramya Krishnan', 'Rana Daggubati', 'Rani Mukherjee', 'Ranveer Singh',
  'Rashmi Sharma', 'Ratan Tata', 'Ravi Shankar', 'Ravindra Jadeja', 'Renu Devi',
  'Reema Sen', 'Reshma Patel', 'Revathi Devi', 'Rhea Kapoor', 'Rishabh Pant',
  'Rita Devi', 'Ritesh Deshmukh', 'Ritu Arya', 'Rohit Shetty', 'Rohini Devi',
  'Roshni Chopra', 'Ruchi Gupta', 'Rudra Pratap', 'Rupali Ganguly', 'Rupesh Kumar',
  'Saba Khan', 'Sachin Tendulkar', 'Sagarika Ghose', 'Sahil Sheikh', 'Sai Pallavi',
  'Saif Ali Khan', 'Sakshi Malik', 'Salman Khan', 'Sameera Reddy', 'Sampath Kumar',
  'Samyuktha Nair', 'Sandhya Mridul', 'Sangeeta Bijlani', 'Sania Mirza', 'Sanjay Mishra',
  'Sanjana Singh', 'Santhosh Kumar', 'Santosh Devi', 'Saraswati Devi', 'Sarita Devi',
  'Saroj Khan', 'Sarthak Das', 'Sarvesh Tiwari', 'Sashi Prabhu', 'Sathya Sai',
  'Satish Kumar', 'Satyavathi Devi', 'Savita Halappanavar', 'Savita Prabhune', 'Seema Biswas',
  'Shah Rukh Khan', 'Shailey Gupta', 'Shakti Kapoor', 'Shalini Pandey', 'Shamim Khan',
  'Shankar Mahadevan', 'Shantanu Moitra', 'Shanti Devi', 'Sharmila Tagore', 'Shashi Tharoor',
  'Sheela Devi', 'Shefali Shah', 'Shekhar Kapur', 'Shekhar Ravjiani', 'Shenaz Treasurywala',
  'Shilpa Shetty', 'Shivani Saxena', 'Shivraj Chouhan', 'Shreya Ghoshal', 'Shruti Haasan',
  'Shubham Kumar', 'Shweta Salve', 'Siddharth Malhotra', 'Siddhi Mahajani', 'Simran Kaur',
  'Sita Devi', 'Smita Patil', 'Sneha Ullal', 'Soham Deshmukh', 'Sonali Bendre',
  'Sonia Gandhi', 'Sonia Mishra', 'Sonu Nigam', 'Sourabh Joshi', 'Sreelekha Mukherji',
  'Sridevi Kapoor', 'Srikant Bharadwaj', 'Srinivas Rao', 'Sruthi Rajan', 'Subhadra Devi',
  'Subhash Chandra', 'Suchitra Krishnamoorthi', 'Sudha Murthy', 'Sudheer Babu', 'Sujatha Devi',
  'Sukanya Devi', 'Suman Kumar', 'Sumitra Devi', 'Sundar Pichai', 'Sunidhi Chauhan',
  'Sunil Shetty', 'Sunita Devi', 'Supriya Pathak', 'Suraj Sharma', 'Surekha Sikri',
  'Suresh Raina', 'Suriya Kumar', 'Surya Narayana', 'Sushant Singh', 'Sushma Devi',
  'Swara Bhaskar', 'Swathi Reddy', 'Tanya Singh', 'Tanushree Dutta', 'Tanvi Hegde',
  'Tapasvi Mehta', 'Tara Sharma', 'Tarun Kumar', 'Tejaswini Kolhapure', 'Tina Dutta',
  'Trisha Krishnan', 'Trishna Mukherjee', 'Tulsi Das', 'Uday Chopra', 'Ujjwal Nikam',
  'Uma Devi', 'Umesh Yadav', 'Urvashi Rautela', 'Usha Rani', 'Utkarsh Sharma',
  'Vaishali Sawant', 'Vandana Gupte', 'Varun Dhawan', 'Vasundhara Devi', 'Vedika Borkar',
  'Venkatesh Prasad', 'Venkateswara Rao', 'Vidya Balan', 'Vijay Devarakonda', 'Vijayalakshmi Devi',
  'Vikas Khanna', 'Vikram Bhatt', 'Vinay Pathak', 'Vinita Nair', 'Vinod Khanna',
  'Vishal Dadlani', 'Vishnu Vardhan', 'Vishwajeet Pradhan', 'Vivek Oberoi', 'Vyjayanthimala Devi',
  'Yami Gautam', 'Yash Chopra', 'Yashika Anand', 'Yashoda Devi', 'Yogendra Singh',
  'Yogeshwari Deshmukh', 'Yukta Mookhey', 'Zara Khan', 'Zareen Khan', 'Zoya Afroz',
  'Malaika Arora', 'Amrita Arora', 'Nargis Fakhri', 'Kriti Sanon', 'Disha Patani',
  'Jacqueline Fernandez', 'Nushrat Bharucha', 'Taapsee Pannu', 'Bhumi Pednekar', 'Kiara Advani',
  'Raveena Tandon', 'Karisma Kapoor', 'Juhi Chawla', 'Kajol Devgan', 'Rani Mukerji',
  'Preity Zinta', 'Aishwarya Rai', 'Madhuri Dixit', 'Jaya Bachchan', 'Waheeda Rehman',
  'Anushka Sharma', 'Katrina Kaif', 'Deepika Padukone', 'Alia Bhatt', 'Kareena Kapoor',
  'Raashi Khanna', 'Pooja Hegde', 'Anupama Parameswaran', 'Samantha Ruth Prabhu', 'Nayanthara',
  'Keerthy Suresh', 'Sai Pallavi', 'Rashmika Mandanna', 'Shraddha Kapoor', 'Mrunal Thakur',
  'Shahid Kapoor', 'Akshay Kumar', 'Ajay Devgn', 'Hrithik Roshan', 'Ranbir Kapoor',
  'Aamir Khan', 'Salman Khan', 'Vicky Kaushal', 'Ayushmann Khurrana', 'Rajkummar Rao',
  'Allu Arjun', 'Mahesh Babu', 'Prabhas', 'Ram Charan', 'Jr NTR',
  'Chiranjeevi', 'Pawan Kalyan', 'Dhanush', 'Vijay', 'Rajinikanth',
  'Fahadh Faasil', 'Mohanlal', 'Mammootty', 'Dulquer Salmaan', 'Prithviraj Sukumaran',
  'Virat Kohli', 'MS Dhoni', 'Sachin Tendulkar', 'Rohit Sharma', 'Jasprit Bumrah',
  'Smriti Mandhana', 'Mithali Raj', 'Harmanpreet Kaur', 'P V Sindhu', 'Saina Nehwal',
  'Neeraj Chopra', 'Milkha Singh', 'P T Usha', 'Mary Kom', 'Abhinav Bindra',
  'Vishwanathan Anand', 'Sania Mirza', 'Leander Paes', 'Saurav Ganguly', 'Kapil Dev',
  'Sunil Chhetri', 'Anil Kumble', 'Rahul Dravid', 'VVS Laxman', 'Sachin Pilot',
  'Jyotiraditya Scindia', 'Nitin Gadkari', 'Amit Shah', 'Rajnath Singh', 'Piyush Goyal',
  'Smriti Irani', 'Nirmala Sitharaman', 'S Jaishankar', 'Ashok Gehlot', 'Shivraj Chouhan',
  'Yogi Adityanath', 'Mamata Banerjee', 'Arvind Kejriwal', 'Bhagwant Mann', 'M K Stalin',
  'Pinarayi Vijayan', 'Jagan Mohan Reddy', 'Chandrababu Naidu', 'H D Kumaraswamy', 'Basavaraj Bommai',
  'Raghubar Das', 'Manohar Lal Khattar', 'Himanta Biswa Sarma', 'Eknath Shinde', 'Uddhav Thackeray',
  'Shahrukh Khan', 'Amir Khan', 'Mohan Das', 'Ravi Kumar', 'Rajeshwari Iyer',
  'Hariprasad Chaurasia', 'Bhimsen Joshi', 'Ravi Shankar', 'Zakir Hussain', 'Amjad Ali Khan',
  'Lata Mangeshkar', 'Asha Bhosle', 'Kishore Kumar', 'Mohammad Rafi', 'Mukesh Chand',
  'Shreya Ghoshal', 'Sonu Nigam', 'Arjit Singh', 'Shankar Mahadevan', 'K J Yesudas',
  'A R Rahman', 'Ilaiyaraaja', 'R D Burman', 'S D Burman', 'Anu Malik',
  'Vishal Dadlani', 'Shekhar Ravjiani', 'Loy Mendonsa', 'Ehsaan Noorani', 'Nusrat Fateh Ali'
];

const ELECTIONS = [
  {
    title: 'Lok Sabha General Election 2026',
    description: 'By order of the Election Commission of India, the 18th Lok Sabha General Election is hereby notified. All registered electors are commanded to exercise their franchise to elect the honourable members of the House of the People. The Commission directs all administrative machinery to ensure free, fair, and peaceful conduct of this sacred democratic exercise.',
    instanceType: 'government',
    status: 'active',
  },
  {
    title: 'Municipal Corporation Chairperson Election',
    description: 'Proclamation under Section 34 of the Municipal Corporation Act: Election for the Office of the City Mayor and Municipal Chairperson is declared. The civic administration is directed to enforce the Model Code of Conduct with immediate effect. All wards shall report to the designated polling stations to cast their ballots for urban governance.',
    instanceType: 'local',
    status: 'active',
  },
  {
    title: 'University Student Council Election 2026',
    description: 'Notification issued under the University Statutes: The triennial election to the Student Council is hereby convened. Positions of President, Vice-President, General Secretary, and Council Members shall be filled by direct election of the student body. The Election Authority enjoins all bonafide students to participate in this democratic tradition of academic self-governance.',
    instanceType: 'educational',
    status: 'pending',
  },
  {
    title: 'State Legislative Assembly Election',
    description: 'Summons by the Governor under Article 174 of the Constitution: Election to fill vacancies in the Legislative Assembly is ordered. The respective constituencies are directed to elect their representatives to the House. The Chief Electoral Officer shall ensure compliance with all statutory provisions and timelines prescribed herein.',
    instanceType: 'government',
    status: 'completed',
  },
  {
    title: 'Panchayat Raj Institution Election',
    description: 'Notification under the Panchayati Raj Act: Election for the offices of Sarpanch, Panchayat Samiti Members, and Zilla Parishad Members are hereby declared. The three-tier system of rural local governance shall be constituted through direct election. All Gram Sabhas are directed to prepare the final electoral rolls for publication.',
    instanceType: 'local',
    status: 'active',
  },
  {
    title: 'College Academic Senate Election',
    description: 'Resolution of the Academic Council: Election to the College Academic Senate for the term 2026-2028 is announced. Faculty representatives and student nominees shall be elected to the highest academic decision-making body of the institution. The Electoral Officer shall conduct the poll in accordance with the approved election bylaws.',
    instanceType: 'educational',
    status: 'pending',
  },
  {
    title: 'National Housing Board Election',
    description: 'Order under the National Housing Authority Act: Biennial election to the Board of Directors of the National Housing Cooperative is declared. Shareholders in good standing are entitled to cast one vote per share held. The Returning Officer shall publish the final list of eligible voters and candidate nominations.',
    instanceType: 'local',
    status: 'active',
  },
  {
    title: 'Supreme Court Bar Association Election',
    description: 'Notice pursuant to Rule 8 of the SCBA Election Rules: Annual election to the Executive Committee of the Supreme Court Bar Association is scheduled. Advocates-on-Record and Senior Advocates enrolled with the Registry are eligible to vote. The electoral roll shall close fifteen days prior to the date of polling.',
    instanceType: 'government',
    status: 'completed',
  },
  {
    title: 'School Management Committee Election',
    description: 'Directive under the Right to Education Act, 2009: Election to the School Management Committee comprising parent representatives, teacher nominees, and community members is constituted. The Committee shall oversee the academic and infrastructural development of the institution for the ensuing academic year.',
    instanceType: 'educational',
    status: 'pending',
  },
  {
    title: 'Industrial Workers Union Election',
    description: 'Notification under the Trade Unions Act, 1926: Election to the office bearers of the Workers Union is called. The Union shall elect President, Vice-President, General Secretary, and Executive Council Members for a two-year term. The election shall be conducted by secret ballot under the supervision of the appointed Election Officer.',
    instanceType: 'government',
    status: 'active',
  },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomDate(startDays, endDays) {
  const now = Date.now();
  const start = now + startDays * 86400000;
  const end = now + endDays * 86400000;
  return new Date(start + Math.random() * (end - start));
}

const CANDIDATE_STATEMENTS = [
  'I pledge to uphold the Constitution and serve the people with integrity, transparency, and unwavering dedication to the principles of justice and equality.',
  'My vision is to build a prosperous and inclusive community through sustainable development, accountable governance, and active citizen participation.',
  'I shall prioritise education, healthcare, and infrastructure as the three pillars of progress, ensuring no citizen is left behind in our march toward development.',
  'With a commitment to zero tolerance for corruption, I will establish robust mechanisms for transparency, public audit, and citizen oversight in all administrative matters.',
  'I stand for empowering the youth through skill development, employment opportunities, and entrepreneurship support as the foundation of our nation\'s future.',
  'Agricultural revitalisation, farmer welfare, and rural infrastructure shall be my foremost priorities in addressing the aspirations of our agrarian community.',
  'I will champion the cause of environmental sustainability, renewable energy adoption, and climate resilience as essential imperatives for intergenerational equity.',
  'My agenda focuses on digital governance, technological modernisation of public services, and bridging the urban-rural digital divide.',
  'I commit to strengthening local self-governance institutions, ensuring participatory democracy reaches the last mile of our administrative hierarchy.',
  'Social justice, women empowerment, and affirmative action for marginalised communities will form the cornerstone of my policy framework.',
  'I shall work tirelessly to attract investment, foster industrial growth, and create gainful employment opportunities for the skilled youth of this constituency.',
  'Public safety, law and order, and judicial efficiency are non-negotiable priorities that I will pursue with the full authority of this office.',
  'My tenure shall be defined by accessible, accountable, and responsive governance that places the citizen at the centre of every decision.',
  'I will establish a citizen charter with measurable service delivery benchmarks and hold regular town halls to ensure direct democratic accountability.',
  'Cultural preservation, heritage conservation, and promotion of local arts and crafts shall receive my dedicated attention and policy support.',
  'I envision a digitally literate constituency where every household has access to broadband connectivity, e-governance services, and digital skilling opportunities.',
  'Water security, watershed management, and sustainable groundwater utilisation are critical challenges that demand immediate and coordinated policy intervention.',
  'I shall establish a constituency grievance redressal system with time-bound resolution of citizen complaints and transparent tracking mechanisms.',
  'My governance model emphasises outcome-based budgeting, performance auditing, and evidence-based policy making for maximising developmental impact.',
  'I pledge to conduct myself with the highest standards of ethical conduct, declaring all assets annually and submitting to independent oversight mechanisms.',
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 10) {
      console.log('Test data already exists. Drop the database first if you want to reseed.');
      console.log(`Current users: ${existingUsers}`);
      process.exit(0);
    }

    console.log('Creating 500 test users...');
    const users = [];
    const admin = await User.findOne({ role: 'admin' });

    const namePool = pickN(NAMES, 500);

    for (let i = 0; i < 500; i++) {
      const name = namePool[i];
      const email = `${name.toLowerCase().replace(/[\s.]+/g, '.').replace(/[^a-z.]/g, '')}.${i + 1}@electorate.in`;
      const user = await User.create({
        name,
        email,
        phone: `9${String(7000000000 + i).slice(0, 9)}`,
        password: 'password123',
        role: 'voter',
        isVerified: true,
      });
      users.push(user);
      if ((i + 1) % 100 === 0) console.log(`  Created ${i + 1}/500 users`);
    }
    console.log('  500 users created successfully.\n');

    const electionRecords = [];
    for (let i = 0; i < ELECTIONS.length; i++) {
      const e = ELECTIONS[i];
      let startTime, endTime, nominationDeadline;

      switch (e.status) {
        case 'completed':
          startTime = randomDate(-60, -30);
          endTime = randomDate(-30, -1);
          nominationDeadline = new Date(startTime.getTime() - 7 * 86400000);
          break;
        case 'active':
          startTime = randomDate(-14, -2);
          endTime = randomDate(1, 7);
          nominationDeadline = new Date(startTime.getTime() - 5 * 86400000);
          break;
        case 'pending':
          startTime = randomDate(7, 21);
          endTime = randomDate(22, 35);
          nominationDeadline = new Date(startTime.getTime() - 5 * 86400000);
          break;
      }

      const election = await Election.create({
        title: e.title,
        description: e.description,
        instanceType: e.instanceType,
        status: e.status,
        startTime,
        endTime,
        nominationDeadline,
        eligibleVoters: users.map(u => u._id),
        createdBy: admin._id,
        totalVotes: 0,
      });
      electionRecords.push(election);
      console.log(`Created election: "${e.title}" [${e.status}]`);
    }

    console.log('\nCreating nominations and candidates...');
    for (let i = 0; i < electionRecords.length; i++) {
      const election = electionRecords[i];
      const description = ELECTIONS[i];
      const candidateCount = 5 + Math.floor(Math.random() * 6);
      const selectedUsers = pickN(users, candidateCount);

      const approvedCount = election.status === 'completed' || election.status === 'active'
        ? candidateCount
        : Math.min(candidateCount, 3 + Math.floor(Math.random() * 3));

      for (let j = 0; j < candidateCount; j++) {
        const user = selectedUsers[j];
        const isApproved = j < approvedCount;
        const status = isApproved ? 'approved' : (Math.random() > 0.5 ? 'pending' : 'rejected');

        await Nomination.create({
          user: user._id,
          election: election._id,
          statement: CANDIDATE_STATEMENTS[j % CANDIDATE_STATEMENTS.length],
          status,
          reviewedBy: isApproved || status === 'rejected' ? admin._id : undefined,
          reviewedAt: isApproved || status === 'rejected' ? new Date() : undefined,
        });

        if (isApproved) {
          election.candidates.push(user._id);
        }
      }

      await election.save();
      console.log(`  ${description.title}: ${candidateCount} nominations (${approvedCount} approved)`);
    }

    console.log('\nCasting votes for completed and active elections...');
    let totalVotes = 0;
    for (const election of electionRecords) {
      if (election.status !== 'completed' && election.status !== 'active') continue;
      if (election.candidates.length === 0) continue;

      const votingUsers = election.status === 'completed'
        ? pickN(users, 200 + Math.floor(Math.random() * 200))
        : pickN(users, 50 + Math.floor(Math.random() * 100));

      const salt = Buffer.from(election._id.toString()).toString('base64');

      for (const voter of votingUsers) {
        const candidateId = pickRandom(election.candidates);
        const userHash = crypto
          .createHash('sha256')
          .update(voter._id.toString() + election._id.toString() + salt)
          .digest('hex');

        const existingVote = await Vote.findOne({ election: election._id, userHash });
        if (existingVote) continue;

        const encryptedCandidate = encrypt(candidateId.toString());
        const encryptedData = JSON.stringify(encryptedCandidate);

        await Vote.create({
          election: election._id,
          userHash,
          candidateId: encryptedData,
          receiptToken: uuidv4(),
        });

        election.totalVotes += 1;
        totalVotes++;
      }

      await election.save();
      const idx = electionRecords.indexOf(election);
      console.log(`  ${ELECTIONS[idx].title}: ${votingUsers.length} votes cast`);
    }

    console.log(`\nTotal votes cast across all elections: ${totalVotes}`);
    console.log('\nSeed complete. Test data summary:');
    console.log('  500 voters created (password: password123)');
    console.log('  10 elections with authoritative descriptions');
    console.log('  5-10 candidates per election');
    console.log('  Votes distributed across completed and active elections');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
