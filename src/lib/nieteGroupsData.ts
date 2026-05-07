// School-to-arm assignments for the Digital Coach experiment.
// Source: Digital Coach Study – Sampling and Rollout Plan (Schoolwise Assignment.csv)
// Group A = DC + Human coaching | Group B = DC only | Group C = Traditional coaching (control)

export const GROUP_A_EMIS: number[] = [
  // Urban-II Large
  274, 259, 291, 902, 261, 281, 280, 917, 255, 271,
  // Urban-II Medium
  903, 907, 262, 292, 270,
  // Urban-II Small
  252,
  // Urban-I Large
  215, 234, 914, 240, 209, 216, 219, 222, 913,
  // Urban-I Medium
  246, 235, 242, 229, 241, 227,
  // Urban-I Small
  904,
  // B.K Rural Small
  413, 437, 416, 432, 439, 462, 438, 460, 408, 453, 425, 433, 412,
  // B.K Rural Large
  445, 454, 464,
  // B.K Rural Medium
  435, 476, 415, 463, 479, 467, 450,
  // Sihala Rural Large
  525, 508, 509, 554,
  // Sihala Rural Small
  537, 526, 535, 533, 571, 559, 566, 562, 531,
  // Sihala Rural Medium
  529, 575, 536, 547, 539, 511, 552, 505,
  // Tarnol Rural Large
  921, 923, 611, 651, 630, 641, 924,
  // Tarnol Rural Medium
  609, 624, 649, 625, 622, 612, 619,
  // Tarnol Rural Small
  644, 636, 422, 635,
  // Nilore Rural Large
  745, 760, 744, 725, 722,
  // Nilore Rural Small
  735, 721, 742, 732, 729, 740, 709, 746, 715, 737,
  // Nilore Rural Medium
  743, 739, 714, 754,
];

export const GROUP_B_EMIS: number[] = [
  // Urban-II Large
  265, 906, 284, 268, 919, 290, 918, 288, 916,
  // Urban-II Medium
  272, 275, 256, 253, 260,
  // Urban-II Small
  263,
  // Urban-I Large
  212, 231, 204, 300, 908, 206, 208, 226, 236,
  // Urban-I Medium
  221, 232, 220, 218, 203, 230,
  // Urban-I Small
  248,
  // B.K Rural Small
  455, 431, 421, 436, 424, 414, 418, 426, 473, 434, 420, 404,
  // B.K Rural Large
  470, 466, 442,
  // B.K Rural Medium
  478, 447, 423, 417, 430, 474,
  // Sihala Rural Large
  506, 510, 925,
  // Sihala Rural Small
  516, 507, 557, 564, 524, 563, 570, 558, 568, 522,
  // Sihala Rural Medium
  523, 514, 567, 527, 518, 556, 565, 520, 530,
  // Tarnol Rural Large
  613, 654, 652, 628, 655, 614, 629, 647,
  // Tarnol Rural Medium
  653, 621, 623, 631, 638, 922, 603,
  // Tarnol Rural Small
  650, 634, 640, 642,
  // Nilore Rural Large
  707, 723, 734, 759, 726,
  // Nilore Rural Small
  736, 762, 764, 747, 731, 758, 750, 749, 767, 730,
  // Nilore Rural Medium
  751, 763, 765, 748, 755,
];

export const GROUP_C_EMIS: number[] = [
  // Urban-II Large
  277, 289, 282, 901, 283, 910, 258, 269, 909, 294,
  // Urban-II Medium
  273, 266, 254, 264,
  // Urban-II Small
  285,
  // Urban-I Large
  912, 245, 217, 905, 211, 295, 228, 205,
  // Urban-I Medium
  210, 915, 225, 247, 243, 244,
  // Urban-I Small
  249, 237,
  // B.K Rural Small
  461, 475, 926, 427, 472, 440, 468, 429, 465, 428, 457, 459, 441,
  // B.K Rural Large
  456, 444, 469, 477,
  // B.K Rural Medium
  451, 419, 471, 411, 458, 452, 448,
  // Sihala Rural Large
  515, 550, 538,
  // Sihala Rural Small
  528, 532, 549, 540, 517, 553, 521, 560, 551, 513,
  // Sihala Rural Medium
  548, 569, 519, 534, 573, 512, 574, 555, 920,
  // Tarnol Rural Large
  617, 620, 610, 632, 615, 627, 618,
  // Tarnol Rural Medium
  604, 637, 626, 606, 643, 646, 648,
  // Tarnol Rural Small
  633, 639, 645,
  // Nilore Rural Large
  761, 741, 708, 733, 717,
  // Nilore Rural Small
  719, 757, 718, 703, 704, 752, 766, 756, 724, 720,
  // Nilore Rural Medium
  727, 716, 738, 728,
];

export const ALL_EXPERIMENT_EMIS = [...GROUP_A_EMIS, ...GROUP_B_EMIS, ...GROUP_C_EMIS];

export const GROUP_LABELS: Record<string, string> = {
  A: "DC + Human Coaching",
  B: "DC Only",
  C: "Traditional Coaching",
};
