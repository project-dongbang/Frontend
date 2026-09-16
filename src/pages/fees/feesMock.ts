export type FeesTransactionType = 'income' | 'expense'

export type FeesTransaction = {
  id: string
  date: string
  title: string
  description: string
  category: string
  amount: number
  type: FeesTransactionType
  author: string
  proofText: string
}

export const feesSummary = {
  balance: 1163900,
  semesterExpense: 1196100,
  paidCount: 58,
  totalCount: 64,
}

export const feesTransactions: FeesTransaction[] = [
  {
    id: 'transaction-1',
    date: '2026.08.31',
    title: '개강 총회 간식',
    description: '동아리마트',
    category: '행사 운영',
    amount: 78500,
    type: 'expense',
    author: '이서연',
    proofText: '상세 보기',
  },
  {
    id: 'transaction-2',
    date: '2026.08.28',
    title: '세미나실 대관',
    description: '성심관 대관',
    category: '공간 대관',
    amount: 120000,
    type: 'expense',
    author: '김동방',
    proofText: '상세 보기',
  },
  {
    id: 'transaction-3',
    date: '2026.08.20',
    title: '도메인 연간 결제',
    description: '도메인 등록처',
    category: '운영비',
    amount: 19000,
    type: 'expense',
    author: '박지훈',
    proofText: '상세 보기',
  },
  {
    id: 'transaction-4',
    date: '2026.08.15',
    title: '해커톤 준비 물품',
    description: '교내 문구점',
    category: '물품 구매',
    amount: 300000,
    type: 'expense',
    author: '이서연',
    proofText: '영수증 보기',
  },
  {
    id: 'transaction-5',
    date: '2026.08.12',
    title: '신입 모집 포스터 인쇄',
    description: '교내 출력실',
    category: '홍보비',
    amount: 46200,
    type: 'expense',
    author: '박지훈',
    proofText: '영수증 보기',
  },
  {
    id: 'transaction-6',
    date: '2026.08.10',
    title: '2학기 회비',
    description: '회원 회비 · 이월금 포함',
    category: '회비 수입',
    amount: 2360000,
    type: 'income',
    author: '시스템',
    proofText: '58건 · 이월금 포함',
  },
]

export type FeePaymentStatus = 'paid' | 'unpaid'

export type FeeCollection = {
  id: string
  title: string
  dueDate: string
  bank: string
  accountNumber: string
  accountHolder: string
}

export type FeePaymentMember = {
  id: string
  name: string
  studentId: string
  generation: string
  amount: number
  status: FeePaymentStatus
}

export const feeCollections: FeeCollection[] = [
  {
    id: 'collection-1',
    title: '2026년 2학기 정기 회비',
    dueDate: '2026.09.20',
    bank: '카카오뱅크',
    accountNumber: '3333-00-0000000',
    accountHolder: '김동방',
  },
  {
    id: 'collection-2',
    title: '2026년 1학기 정기 회비',
    dueDate: '2026.03.20',
    bank: '카카오뱅크',
    accountNumber: '3333-00-0000000',
    accountHolder: '김동방',
  },
]

const feeMemberNames = [
  '정하늘',
  '윤민지',
  '강준호',
  '김동방',
  '이서연',
  '박지훈',
  '최유진',
  '김민준',
  '이도윤',
  '박서준',
  '최지우',
  '정서윤',
  '강하윤',
  '조수빈',
  '윤지호',
  '장예린',
  '임현우',
  '한서진',
  '오지민',
  '신유나',
  '서민서',
  '권도현',
  '황수아',
  '안지안',
  '송준서',
  '류예원',
  '전시우',
  '홍채원',
  '문건우',
  '양다은',
  '배서현',
  '백승우',
  '남소율',
  '심태윤',
  '노유빈',
  '하재윤',
  '곽나연',
  '성지후',

  '김예진',
  '이준혁',
  '박수연',
  '최성민',
  '정유리',
  '강태현',
  '조은서',
  '윤재민',
  '장수아',
  '임지훈',
  '한나영',
  '오준호',
  '신서영',
  '서우진',
  '권예린',
  '황민수',
  '안서현',
  '송하준',
  '류지안',
  '전도윤',
  '홍예은',
  '문시윤',
  '양지우',
  '배민재',
  '백지수',
  '남은우',
]

export const feePaymentMembers: FeePaymentMember[] =
  feeMemberNames.map((name, index) => ({
    id: `member-${index}`,
    name,
    studentId: String(20260001 + index),
    generation: `${11 + (index % 3)}기`,
    amount: 40000,
    status: index < 58 ? 'paid' : 'unpaid',
  }))