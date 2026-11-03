export type Locale = 'en' | 'ms';

export const locales: Locale[] = ['en', 'ms'];
export const defaultLocale: Locale = 'en';

/**
 * Every string the interface shows. Nothing is hardcoded in a component, so
 * adding a language means adding one object here.
 */
const en = {
  localeName: 'English',
  nav: {
    skipToContent: 'Skip to content',
    howItWorks: 'How it works',
    privacy: 'Privacy',
    language: 'Language',
    create: 'Create a tree',
    open: 'Open a saved file',
  },
  hero: {
    title: 'Everyone who got you here, standing up in three dimensions.',
    lede:
      'Type in the people you remember. The tree works out the generations, pairs the couples and spreads the branches, then hands you something you can turn around and look at.',
    create: 'Start with yourself',
    open: 'Open a saved file',
    privacyNote: 'Nothing is uploaded. Nothing is kept after you close the tab.',
    figureCaption: 'Four generations, laid out by the same engine your tree will use.',
  },
  stats: {
    generations: 'generations',
    members: 'people',
    branches: 'branches',
  },
  create: {
    title: 'Start with yourself',
    lede: 'Everyone else is placed in relation to this person, and every label the tree shows is worked out from here.',
    nameLabel: 'Your full name',
    namePlaceholder: 'The name your family would recognise',
    genderLabel: 'Gender',
    gender: { male: 'Male', female: 'Female', unspecified: 'Rather not say' },
    back: 'Back to the start',
    loadExample: 'Load the example family',
    notBuiltYet: 'Grandparents, parents, children and the review step come next. What you type here carries into them.',
  },
  how: {
    title: 'What happens when you add someone',
    steps: [
      {
        marker: 'G-2',
        title: 'You name a relative',
        body: 'Grandparents, parents, children, cousins. Anyone you cannot place yet, you leave blank.',
      },
      {
        marker: 'G-1',
        title: 'The links get checked',
        body: 'Each parent, child and partner link is verified. A person cannot end up as their own ancestor, and a child cannot end up with three parents.',
      },
      {
        marker: 'G0',
        title: 'The tree arranges itself',
        body: 'Generations stack, couples pair up and branches spread apart. Enter the same family twice and you get the same tree twice.',
      },
      {
        marker: 'G+1',
        title: 'You take it with you',
        body: 'Turn the tree around, open anyone to read their details, then save a picture to print or a file to carry on with later.',
      },
    ],
  },
  privacy: {
    title: 'This runs on your machine',
    body:
      'There is no sign-up and no database. The people you enter live in this tab for as long as it is open. The only copy that outlasts the session is the file you choose to save.',
    points: [
      'No account to create',
      'Nothing stored on a server',
      'No analytics, no third-party scripts',
      'Served from your own homelab',
    ],
  },
  footer: {
    tagline: 'Your family. Your legacy.',
    meta: 'Runs entirely in the browser',
  },
  relation: {
    self: 'You',
    father: 'Father',
    mother: 'Mother',
    parent: 'Parent',
    paternalGrandfather: 'Grandfather, father’s side',
    paternalGrandmother: 'Grandmother, father’s side',
    maternalGrandfather: 'Grandfather, mother’s side',
    maternalGrandmother: 'Grandmother, mother’s side',
    grandparent: 'Grandparent',
    brother: 'Brother',
    sister: 'Sister',
    sibling: 'Sibling',
    son: 'Son',
    daughter: 'Daughter',
    child: 'Child',
    grandson: 'Grandson',
    granddaughter: 'Granddaughter',
    grandchild: 'Grandchild',
    spouse: 'Spouse',
    uncle: 'Uncle',
    aunt: 'Aunt',
    cousin: 'Cousin',
    ancestor: 'Ancestor',
    descendant: 'Descendant',
    relative: 'Relative',
  },
};

/** English is the reference shape; every other locale must match it exactly. */
type Messages = typeof en;

const ms: Messages = {
  localeName: 'Bahasa Melayu',
  nav: {
    skipToContent: 'Terus ke kandungan',
    howItWorks: 'Cara ia berfungsi',
    privacy: 'Privasi',
    language: 'Bahasa',
    create: 'Bina salasilah',
    open: 'Buka fail tersimpan',
  },
  hero: {
    title: 'Semua yang membawa anda ke sini, berdiri dalam tiga dimensi.',
    lede:
      'Masukkan nama yang anda ingat. Salasilah akan mengira generasi, memasangkan pasangan dan membuka cabang, kemudian menyerahkan sesuatu yang boleh anda pusing dan tatap.',
    create: 'Mula dengan diri anda',
    open: 'Buka fail tersimpan',
    privacyNote: 'Tiada apa dimuat naik. Tiada apa tinggal selepas tab ditutup.',
    figureCaption: 'Empat generasi, disusun oleh enjin yang sama untuk salasilah anda.',
  },
  stats: {
    generations: 'generasi',
    members: 'orang',
    branches: 'cabang',
  },
  create: {
    title: 'Mula dengan diri anda',
    lede: 'Semua orang lain diletakkan berdasarkan orang ini, dan setiap label yang ditunjuk dikira dari sini.',
    nameLabel: 'Nama penuh anda',
    namePlaceholder: 'Nama yang keluarga anda kenal',
    genderLabel: 'Jantina',
    gender: { male: 'Lelaki', female: 'Perempuan', unspecified: 'Tidak mahu nyatakan' },
    back: 'Balik ke mula',
    loadExample: 'Muatkan keluarga contoh',
    notBuiltYet: 'Datuk nenek, ibu bapa, anak dan langkah semakan menyusul. Apa yang anda taip di sini akan dibawa ke sana.',
  },
  how: {
    title: 'Apa yang berlaku bila anda tambah seseorang',
    steps: [
      {
        marker: 'G-2',
        title: 'Anda namakan seorang saudara',
        body: 'Datuk nenek, ibu bapa, anak, sepupu. Sesiapa yang belum pasti, biar kosong.',
      },
      {
        marker: 'G-1',
        title: 'Pertalian disemak',
        body: 'Setiap pertalian ibu bapa, anak dan pasangan disemak. Seseorang tidak boleh jadi nenek moyang dirinya sendiri, dan seorang anak tidak boleh ada tiga ibu bapa.',
      },
      {
        marker: 'G0',
        title: 'Salasilah menyusun sendiri',
        body: 'Generasi bertingkat, pasangan berdampingan dan cabang terbuka. Masukkan keluarga yang sama dua kali, anda dapat salasilah yang sama dua kali.',
      },
      {
        marker: 'G+1',
        title: 'Anda bawa ia bersama',
        body: 'Pusing salasilah, buka sesiapa untuk baca butirannya, kemudian simpan gambar untuk dicetak atau fail untuk disambung nanti.',
      },
    ],
  },
  privacy: {
    title: 'Ini berjalan atas mesin anda',
    body:
      'Tiada pendaftaran dan tiada pangkalan data. Nama yang anda masukkan hidup dalam tab ini selama ia terbuka. Satu-satunya salinan yang kekal ialah fail yang anda pilih untuk simpan.',
    points: [
      'Tiada akaun untuk dibuka',
      'Tiada apa disimpan di pelayan',
      'Tiada analitik, tiada skrip pihak ketiga',
      'Dihidangkan dari homelab anda sendiri',
    ],
  },
  footer: {
    tagline: 'Keluarga anda. Warisan anda.',
    meta: 'Berjalan sepenuhnya dalam pelayar',
  },
  relation: {
    self: 'Anda',
    father: 'Bapa',
    mother: 'Ibu',
    parent: 'Ibu bapa',
    paternalGrandfather: 'Datuk sebelah bapa',
    paternalGrandmother: 'Nenek sebelah bapa',
    maternalGrandfather: 'Datuk sebelah ibu',
    maternalGrandmother: 'Nenek sebelah ibu',
    grandparent: 'Datuk nenek',
    brother: 'Adik beradik lelaki',
    sister: 'Adik beradik perempuan',
    sibling: 'Adik beradik',
    son: 'Anak lelaki',
    daughter: 'Anak perempuan',
    child: 'Anak',
    grandson: 'Cucu lelaki',
    granddaughter: 'Cucu perempuan',
    grandchild: 'Cucu',
    spouse: 'Pasangan',
    uncle: 'Pak cik',
    aunt: 'Mak cik',
    cousin: 'Sepupu',
    ancestor: 'Nenek moyang',
    descendant: 'Keturunan',
    relative: 'Saudara',
  },
};

export const messages: Record<Locale, Messages> = { en, ms };
export type { Messages };
